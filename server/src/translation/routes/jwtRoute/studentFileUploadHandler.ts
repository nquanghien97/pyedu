import { RequestHandler } from 'express';
import * as multer from 'multer';
import { nanoid } from 'nanoid';
import { prisma } from '../../database/prisma';
import { submissionRepository } from '../../database/submission.repo';
import { submissionAttachmentRepository } from '../../database/submissionAttachment.repo';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { cloudinary } from '../../../config/cloudinary';
import { logger } from '../../../lib/logger';
import { notificationService } from '../../../execution/notification/notification.service';

export const uploadSubmission = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Only Word and PDF files are accepted.`));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const uploadFileSubmission: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const assignmentId = req.params.id;

    // Get student profile
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student profile not found' },
      });
      return;
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        exercise: true,
      },
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { message: 'Assignment not found' },
      });
      return;
    }

    // Check max attempts
    if (assignment.maxAttempts) {
      const existingAttempts = await prisma.exerciseSubmission.count({
        where: { assignmentId, studentId: student.id },
      });
      if (existingAttempts >= assignment.maxAttempts) {
        res.status(400).json({
          success: false,
          error: { message: `Đã đạt số lần nộp tối đa (${assignment.maxAttempts})` },
        });
        return;
      }
    }

    // Get uploaded files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: { message: 'No files uploaded' } });
      return;
    }

    if (files.length > 5) {
      res.status(400).json({ success: false, error: { message: 'Bạn chỉ được nộp tối đa 5 file' } });
      return;
    }

    const submissionId = nanoid(36);
    const uploadedAttachments: any[] = [];

    try {
      // Upload files to Cloudinary
      for (const file of files) {
        const uploadResult = await new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'pyedu/submissions',
              resource_type: 'auto',
            },
            (error: unknown, result: { secure_url: string; public_id: string; bytes: number } | undefined) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string; bytes: number });
            }
          );
          uploadStream.end(file.buffer);
        });

        // Save file attachment info
        const attachment = await submissionAttachmentRepository.create({
          submissionId,
          fileName: file.originalname,
          fileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileType: file.mimetype,
          fileSize: uploadResult.bytes,
        });

        uploadedAttachments.push(attachment);
      }

      // Create ExerciseSubmission
      const submission = await submissionRepository.createFileUploadSubmission(
        assignmentId,
        student.id,
        submissionId
      );

      // Trigger notification
      try {
        await notificationService.create({
          userId,
          title: '📤 Bài tập đã được nộp!',
          message: `Bài viết tay cho "${assignment.exercise.title}" đã được nộp thành công và đang chờ giáo viên chấm`,
          notificationType: 'submission_graded',
          metadata: {
            submissionId,
            assignmentId,
            link: `/student/assignments/${assignmentId}`,
          },
        });

        // Also notify the teacher who assigned it
        if (assignment.assignedBy) {
          await notificationService.create({
            userId: assignment.assignedBy,
            title: '📝 Bài tập mới được nộp',
            message: `Học sinh đã nộp bài viết tay cho "${assignment.exercise.title}"`,
            notificationType: 'submission_graded',
            metadata: {
              submissionId,
              assignmentId,
              link: `/teacher/submissions/${submissionId}`,
            },
          });
        }
      } catch (err) {
        logger.error('Failed to trigger upload notification:', err);
      }

      res.status(201).json({
        success: true,
        data: {
          ...submission,
          attachments: uploadedAttachments,
        },
      });
    } catch (error) {
      logger.error('File submission upload failed:', error);
      // Clean up uploaded files in Cloudinary if any
      for (const att of uploadedAttachments) {
        if (att.publicId) {
          try {
            await cloudinary.uploader.destroy(att.publicId);
          } catch (delError) {
            logger.error('Failed to delete attachment from Cloudinary during cleanup:', delError);
          }
        }
      }
      res.status(500).json({ success: false, error: { message: 'Upload bài tập thất bại' } });
    }
  }
);

// GET /api/v1/student/submissions/:id/attachments
export const getSubmissionAttachments: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const submissionId = req.params.id;
    const attachments = await submissionAttachmentRepository.findBySubmissionId(submissionId);
    res.json({ success: true, data: attachments });
  }
);

// DELETE /api/v1/student/submissions/:id/attachments/:attachmentId
export const deleteSubmissionAttachment: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { id: submissionId, attachmentId } = req.params;

    // Verify submission belongs to the student and is not graded yet
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      res.status(404).json({ success: false, error: { message: 'Submission not found' } });
      return;
    }

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student || submission.studentId !== student.id) {
      res.status(403).json({ success: false, error: { message: 'Access denied' } });
      return;
    }

    if (submission.status === 'graded') {
      res.status(400).json({ success: false, error: { message: 'Không thể xóa file của bài đã được chấm' } });
      return;
    }

    const attachment = await submissionAttachmentRepository.findById(attachmentId);
    if (!attachment || attachment.submissionId !== submissionId) {
      res.status(404).json({ success: false, error: { message: 'Attachment not found' } });
      return;
    }

    if (attachment.publicId) {
      try {
        await cloudinary.uploader.destroy(attachment.publicId);
      } catch (err) {
        logger.error('Failed to delete attachment from Cloudinary:', err);
      }
    }

    await submissionAttachmentRepository.delete(attachmentId);
    res.json({ success: true, data: null });
  }
);
