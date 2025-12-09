import express from 'express';
import {
  getQuestions,
  askQuestion,
  answerQuestion,
  markHelpful,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/products/:productId/questions', getQuestions);

// Protected routes
router.post('/products/:productId/questions', protect, askQuestion);
router.put('/questions/:id/answer', protect, answerQuestion);
router.post('/questions/:id/helpful', protect, markHelpful);

// Admin routes
router.delete('/questions/:id', protect, admin, deleteQuestion);

export default router;
