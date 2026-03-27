import * as express from 'express';
import { loginHandler } from './loginHandler';
import { logoutHandler } from './logoutHandler';
import { getGrades, getGradeById, createGrade, updateGrade, deleteGrade } from './gradeHandler';
import { chatbotHandler } from './chatbotHandler';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from './subjectHandler';
import { getTopicsBySubject, getTopicById, createTopic, updateTopic, deleteTopic } from './topicHandler';
import { getExercises, getExerciseById, createExercise, updateExercise, updateExerciseStatus, deleteExercise, addQuestion, updateQuestion, deleteQuestion } from './exerciseHandler';
import { upload, uploadAttachment, deleteAttachment } from './uploadHandler';
import { generateExerciseByAI, generateExerciseFromFile } from './aiGenerateHandler';
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

// Grades
protectedRouter.get('/grades', getGrades);
protectedRouter.get('/grades/:id', getGradeById);
protectedRouter.post('/grades', createGrade);
protectedRouter.put('/grades/:id', updateGrade);
protectedRouter.delete('/grades/:id', deleteGrade);

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

jwtRouter.use(protectedRouter);