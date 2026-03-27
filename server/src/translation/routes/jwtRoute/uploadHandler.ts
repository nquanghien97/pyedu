import { RequestHandler } from 'express';
import * as multer from 'multer';
import { cloudinary } from '../../../config/cloudinary';
import { attachmentRepository } from '../../database/attachment.repo';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { logger } from '../../../lib/logger';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadAttachment: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    return;
  }

  const exerciseId = req.body.exerciseId;
  if (!exerciseId) {
    res.status(400).json({ success: false, error: { message: 'exerciseId is required' } });
    return;
  }

  try {
    const result = await new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pyedu/exercises',
          resource_type: 'auto',
        },
        (error: unknown, result: { secure_url: string; public_id: string; bytes: number } | undefined) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string; bytes: number });
        }
      );
      uploadStream.end(file.buffer);
    });

    const attachment = await attachmentRepository.create({
      exerciseId,
      questionId: req.body.questionId || undefined,
      fileName: file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: file.mimetype,
      fileSize: result.bytes,
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    logger.error('Upload failed:', error);
    res.status(500).json({ success: false, error: { message: 'Upload failed' } });
  }
});

export const deleteAttachment: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const attachment = await attachmentRepository.findById(req.params.id);
  if (!attachment) {
    res.status(404).json({ success: false, error: { message: 'Attachment not found' } });
    return;
  }

  if (attachment.publicId) {
    try {
      await cloudinary.uploader.destroy(attachment.publicId);
    } catch (error) {
      logger.error('Failed to delete from Cloudinary:', error);
    }
  }

  await attachmentRepository.delete(req.params.id);
  res.json({ success: true, data: null });
});
