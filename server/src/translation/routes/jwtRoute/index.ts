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
import { generateExerciseByAI, generateExerciseFromFile, getAiExerciseHistory } from './aiGenerateHandler';
import { getSessions, createSession, deleteSession, getSessionMessages } from './chatSessionHandler';
import { sendMessage } from './chatMessageHandler';
import { getStudentAssignments } from './studentAssignmentHandler';
import { createTeacherAssignment, getTeacherAssignments } from './teacherAssignmentHandler';
import { submitAssignment, getSubmissionById, getAssignmentSubmissions, getMySubmissions, updateSubmissionGrade } from './submissionHandler';
import { getMyProgress, getStudentsProgress, getStudentProgressDetail } from './progressHandler';
import { getTeacherClasses, getTeacherStudents } from './metaHandler';
import { getAutoAssignConfigs, createAutoAssignConfig, updateAutoAssignConfig, deleteAutoAssignConfig, triggerAutoAssign } from './autoAssignHandler';
import { getMe } from './userHandler';
import { requireAdmin, getDashboardStats, getAllUsers, createUser, updateUser, deleteUser } from './adminHandler';
import { getTeacherDashboardStats, getStudentDashboardStats } from './dashboardHandler';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from './notificationHandler';
import { sseStreamHandler } from './sseHandler';
import { getTests, getTestById, createTest, updateTest, deleteTest } from './testHandler';
import { aiExplainHandler } from './aiExplainHandler';
import authMiddleware from '../authMiddleware';

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
protectedRouter.post('/classes', createClass);
protectedRouter.get('/classes/:id/students', getClassStudents);
protectedRouter.post('/classes/:id/students', enrollStudent);
protectedRouter.delete('/classes/:id/students/:studentId', removeStudent);

// Subjects
protectedRouter.get('/subjects', getSubjects);
protectedRouter.get('/subjects/:id', getSubjectById);
protectedRouter.post('/subjects', createSubject);
protectedRouter.put('/subjects/:id', updateSubject);
protectedRouter.delete('/subjects/:id', deleteSubject);

// Topics
protectedRouter.get('/subjects/:subjectId/topics', getTopicsBySubject);
protectedRouter.get('/topics/:id', getTopicById);
protectedRouter.post('/topics', createTopic);
protectedRouter.put('/topics/:id', updateTopic);
protectedRouter.delete('/topics/:id', deleteTopic);

// Exercises
protectedRouter.get('/exercises', getExercises);
protectedRouter.get('/exercises/:id', getExerciseById);
protectedRouter.post('/exercises', createExercise);
protectedRouter.put('/exercises/:id', updateExercise);
protectedRouter.patch('/exercises/:id/status', updateExerciseStatus);
protectedRouter.delete('/exercises/:id', deleteExercise);

// Exercise Questions
protectedRouter.post('/exercises/:id/questions', addQuestion);
protectedRouter.put('/exercises/:id/questions/:questionId', updateQuestion);
protectedRouter.delete('/exercises/:id/questions/:questionId', deleteQuestion);

// File Upload
protectedRouter.post('/uploads/exercise-attachment', upload.single('file'), uploadAttachment);
protectedRouter.delete('/uploads/:id', deleteAttachment);

// AI Generator
protectedRouter.post('/ai/generate-exercise', generateExerciseByAI);
protectedRouter.post('/ai/generate-exercise-by-file', upload.single('file'), generateExerciseFromFile);
protectedRouter.get('/teacher/ai-exercises/history', getAiExerciseHistory);
protectedRouter.post('/ai/explain', aiExplainHandler);

// Teacher Meta Data (for Assign Dropdowns)
protectedRouter.get('/teacher/classes', getTeacherClasses);
protectedRouter.get('/teacher/students', getTeacherStudents);

// Dashboard Stats
protectedRouter.get('/teacher/dashboard-stats', getTeacherDashboardStats);
protectedRouter.get('/student/dashboard-stats', getStudentDashboardStats);

// Teacher Assignments
protectedRouter.post('/teacher/assignments', createTeacherAssignment);
protectedRouter.get('/teacher/assignments', getTeacherAssignments);
protectedRouter.get('/teacher/assignments/:id/submissions', getAssignmentSubmissions);

// Student Assignments
protectedRouter.get('/student/assignments', getStudentAssignments);
protectedRouter.post('/student/assignments/:id/submit', submitAssignment);
protectedRouter.get('/student/assignments/:id/submissions', getMySubmissions);

// Submissions
protectedRouter.get('/submissions/:id', getSubmissionById);
protectedRouter.put('/submissions/:id/grade', updateSubmissionGrade);

// Progress
protectedRouter.get('/progress/me', getMyProgress);
protectedRouter.get('/progress/students', getStudentsProgress);
protectedRouter.get('/progress/students/:studentId', getStudentProgressDetail);

// Auto-Assign Config
protectedRouter.get('/auto-assign', getAutoAssignConfigs);
protectedRouter.post('/auto-assign', createAutoAssignConfig);
protectedRouter.put('/auto-assign/:id', updateAutoAssignConfig);
protectedRouter.delete('/auto-assign/:id', deleteAutoAssignConfig);
protectedRouter.post('/auto-assign/run', triggerAutoAssign);

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
protectedRouter.post('/tests', createTest);
protectedRouter.put('/tests/:id', updateTest);
protectedRouter.delete('/tests/:id', deleteTest);

jwtRouter.use(protectedRouter);