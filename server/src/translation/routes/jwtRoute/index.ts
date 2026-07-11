import * as express from 'express';
import { loginHandler } from './loginHandler';
import { logoutHandler } from './logoutHandler';
import { refreshHandler } from './refreshHandler';
import { getClasses, createClass, getClassStudents, enrollStudent, removeStudent } from './classHandler';
import { chatbotHandler } from './chatbotHandler';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from './subjectHandler';
import { getTopicsBySubject, getTopicById, createTopic, updateTopic, deleteTopic } from './topicHandler';
import { getExercises, getExerciseById, createExercise, updateExercise, updateExerciseStatus, deleteExercise, addQuestion, updateQuestion, deleteQuestion } from './exerciseHandler';
import { upload, uploadAttachment, deleteAttachment } from './uploadHandler';
import { generateExerciseByAI, generateExerciseFromFile, getAiExerciseHistory, generateSolution, regenerateQuestion } from './aiGenerateHandler';
import { getSessions, createSession, deleteSession, getSessionMessages } from './chatSessionHandler';
import { sendMessage } from './chatMessageHandler';
import { getStudentAssignments } from './studentAssignmentHandler';
import { createTeacherAssignment, getTeacherAssignments } from './teacherAssignmentHandler';
import { submitAssignment, getSubmissionById, getAssignmentSubmissions, getMySubmissions, updateSubmissionGrade } from './submissionHandler';
import { uploadSubmission, uploadFileSubmission, getSubmissionAttachments, deleteSubmissionAttachment } from './studentFileUploadHandler';
import { getMyProgress, getStudentsProgress, getStudentProgressDetail } from './progressHandler';
import { getTeacherClasses, getTeacherStudents } from './metaHandler';
import { getAutoAssignConfigs, createAutoAssignConfig, updateAutoAssignConfig, deleteAutoAssignConfig, triggerAutoAssign } from './autoAssignHandler';
import { getMe } from './userHandler';
import { requireAdmin, getDashboardStats, getAllUsers, createUser, updateUser, deleteUser } from './adminHandler';
import { getTeacherDashboardStats, getStudentDashboardStats } from './dashboardHandler';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from './notificationHandler';
import { sseStreamHandler } from './sseHandler';
import { getTests, getTestById, createTest, updateTest, deleteTest, publishTest, startTest, submitTest, getTestLeaderboard, getTestStatistics, getTestResult } from './testHandler';
import { aiExplainHandler } from './aiExplainHandler';
import authMiddleware from '../authMiddleware';
import { requireRole } from '../authMiddleware/roleMiddleware';
import { USER_ROLE } from '../../../generated/prisma/client';

export const jwtRouter = express.Router();

// Public routes
jwtRouter.post('/login', loginHandler);
jwtRouter.post('/logout', logoutHandler);
jwtRouter.post('/auth/refresh', refreshHandler);

// Protected routes - require JWT auth
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware('jwt'));

// User
protectedRouter.get('/users/me', getMe);

// Chat
protectedRouter.post('/chat', chatbotHandler);


// Chat Sessions Phase 2
protectedRouter.get('/chat-sessions', getSessions);
protectedRouter.post('/chat-sessions', createSession);
protectedRouter.delete('/chat-sessions/:id', deleteSession);
protectedRouter.get('/chat-sessions/:id/messages', getSessionMessages);
protectedRouter.post('/chat-sessions/:sessionId/messages', upload.single('file'), sendMessage);

// Classes
protectedRouter.get('/classes', getClasses);
protectedRouter.post('/classes', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createClass);
protectedRouter.get('/classes/:id/students', getClassStudents);
protectedRouter.post('/classes/:id/students', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), enrollStudent);
protectedRouter.delete('/classes/:id/students/:studentId', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), removeStudent);

// Subjects
protectedRouter.get('/subjects', getSubjects);
protectedRouter.get('/subjects/:id', getSubjectById);
protectedRouter.post('/subjects', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createSubject);
protectedRouter.put('/subjects/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateSubject);
protectedRouter.delete('/subjects/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteSubject);

// Topics
protectedRouter.get('/subjects/:subjectId/topics', getTopicsBySubject);
protectedRouter.get('/topics/:id', getTopicById);
protectedRouter.post('/topics', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createTopic);
protectedRouter.put('/topics/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateTopic);
protectedRouter.delete('/topics/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteTopic);

// Exercises
protectedRouter.get('/exercises', getExercises);
protectedRouter.get('/exercises/:id', getExerciseById);
protectedRouter.post('/exercises', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createExercise);
protectedRouter.put('/exercises/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateExercise);
protectedRouter.patch('/exercises/:id/status', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateExerciseStatus);
protectedRouter.delete('/exercises/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteExercise);

// Exercise Questions
protectedRouter.post('/exercises/:id/questions', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), addQuestion);
protectedRouter.put('/exercises/:id/questions/:questionId', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateQuestion);
protectedRouter.delete('/exercises/:id/questions/:questionId', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteQuestion);

// File Upload
protectedRouter.post('/uploads/exercise-attachment', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), upload.single('file'), uploadAttachment);
protectedRouter.delete('/uploads/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteAttachment);

// AI Generator
protectedRouter.post('/ai/generate-exercise', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), generateExerciseByAI);
protectedRouter.post('/ai/generate-exercise-by-file', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), upload.single('file'), generateExerciseFromFile);
protectedRouter.get('/teacher/ai-exercises/history', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getAiExerciseHistory);
protectedRouter.post('/ai/explain', aiExplainHandler);
protectedRouter.post('/ai/generate-solution', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), generateSolution);
protectedRouter.post('/ai/regenerate-question/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), regenerateQuestion);

// Teacher Meta Data (for Assign Dropdowns)
protectedRouter.get('/teacher/classes', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getTeacherClasses);
protectedRouter.get('/teacher/students', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getTeacherStudents);

// Dashboard Stats
protectedRouter.get('/teacher/dashboard-stats', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getTeacherDashboardStats);
protectedRouter.get('/student/dashboard-stats', requireRole(USER_ROLE.STUDENT), getStudentDashboardStats);

// Teacher Assignments
protectedRouter.post('/teacher/assignments', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createTeacherAssignment);
protectedRouter.get('/teacher/assignments', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getTeacherAssignments);
protectedRouter.get('/teacher/assignments/:id/submissions', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getAssignmentSubmissions);

// Student Assignments
protectedRouter.get('/student/assignments', requireRole(USER_ROLE.STUDENT), getStudentAssignments);
protectedRouter.post('/student/assignments/:id/submit', requireRole(USER_ROLE.STUDENT), submitAssignment);
protectedRouter.get('/student/assignments/:id/submissions', requireRole(USER_ROLE.STUDENT), getMySubmissions);
protectedRouter.post('/student/assignments/:id/upload', requireRole(USER_ROLE.STUDENT), uploadSubmission.array('files', 5), uploadFileSubmission);
protectedRouter.get('/student/submissions/:id/attachments', requireRole(USER_ROLE.STUDENT), getSubmissionAttachments);
protectedRouter.delete('/student/submissions/:id/attachments/:attachmentId', requireRole(USER_ROLE.STUDENT), deleteSubmissionAttachment);

// Submissions
protectedRouter.get('/submissions/:id', getSubmissionById);
protectedRouter.put('/submissions/:id/grade', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateSubmissionGrade);

// Progress
protectedRouter.get('/progress/me', requireRole(USER_ROLE.STUDENT), getMyProgress);
protectedRouter.get('/progress/students', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getStudentsProgress);
protectedRouter.get('/progress/students/:studentId', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getStudentProgressDetail);

// Auto-Assign Config
protectedRouter.get('/auto-assign', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getAutoAssignConfigs);
protectedRouter.post('/auto-assign', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createAutoAssignConfig);
protectedRouter.put('/auto-assign/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateAutoAssignConfig);
protectedRouter.delete('/auto-assign/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteAutoAssignConfig);
protectedRouter.post('/auto-assign/run', requireRole(USER_ROLE.ADMIN), triggerAutoAssign);

// Notifications
protectedRouter.get('/notifications', getNotifications);
protectedRouter.get('/notifications/unread-count', getUnreadCount);
protectedRouter.get('/notifications/stream', sseStreamHandler);
protectedRouter.patch('/notifications/read-all', markAllAsRead);
protectedRouter.patch('/notifications/:id/read', markAsRead);
protectedRouter.delete('/notifications/:id', deleteNotification);

// Admin routes
protectedRouter.get('/admin/stats', requireAdmin, getDashboardStats);
protectedRouter.get('/admin/users', requireAdmin, getAllUsers);
protectedRouter.post('/admin/users', requireAdmin, createUser);
protectedRouter.put('/admin/users/:id', requireAdmin, updateUser);
protectedRouter.delete('/admin/users/:id', requireAdmin, deleteUser);

// Tests
protectedRouter.get('/tests', getTests);
protectedRouter.get('/tests/:id', getTestById);
protectedRouter.post('/tests', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), createTest);
protectedRouter.put('/tests/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), updateTest);
protectedRouter.delete('/tests/:id', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), deleteTest);
protectedRouter.patch('/tests/:id/publish', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), publishTest);
protectedRouter.post('/tests/:id/start', requireRole(USER_ROLE.STUDENT), startTest);
protectedRouter.post('/tests/:id/submit', requireRole(USER_ROLE.STUDENT), submitTest);
protectedRouter.get('/tests/:id/leaderboard', getTestLeaderboard);
protectedRouter.get('/tests/:id/statistics', requireRole(USER_ROLE.TEACHER, USER_ROLE.ADMIN), getTestStatistics);
protectedRouter.get('/tests/:id/result', requireRole(USER_ROLE.STUDENT), getTestResult);

jwtRouter.use(protectedRouter);