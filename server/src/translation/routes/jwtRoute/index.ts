import * as express from 'express';
import { loginHandler } from './loginHandler';
import { logoutHandler } from './logoutHandler';
import { getClasses, createClass, getClassStudents, enrollStudent, removeStudent } from './classHandler';
import { chatbotHandler } from './chatbotHandler';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from './subjectHandler';
import { getTopicsBySubject, getTopicById, createTopic, updateTopic, deleteTopic } from './topicHandler';
import { getExercises, getExerciseById, createExercise, updateExercise, updateExerciseStatus, deleteExercise, addQuestion, updateQuestion, deleteQuestion } from './exerciseHandler';
import { upload, uploadAttachment, deleteAttachment } from './uploadHandler';
import { generateExerciseByAI, generateExerciseFromFile } from './aiGenerateHandler';
import { getSessions, createSession, deleteSession, getSessionMessages } from './chatSessionHandler';
import { sendMessage } from './chatMessageHandler';
import { getStudentAssignments } from './studentAssignmentHandler';
import { createTeacherAssignment, getTeacherAssignments } from './teacherAssignmentHandler';
import { getTeacherClasses, getTeacherStudents } from './metaHandler';
import authMiddleware from '../authMiddleware';

export const jwtRouter = express.Router();

// Public routes
jwtRouter.post('/login', loginHandler);
jwtRouter.post('/logout', logoutHandler);

// Protected routes - require JWT auth
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware('jwt'));

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

// Teacher Meta Data (for Assign Dropdowns)
protectedRouter.get('/teacher/classes', getTeacherClasses);
protectedRouter.get('/teacher/students', getTeacherStudents);

// Teacher Assignments
protectedRouter.post('/teacher/assignments', createTeacherAssignment);
protectedRouter.get('/teacher/assignments', getTeacherAssignments);

// Student Assignments
protectedRouter.get('/student/assignments', getStudentAssignments);

jwtRouter.use(protectedRouter);