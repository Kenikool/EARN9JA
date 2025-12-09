import express from 'express';
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  closeChat,
  getUnreadCount,
} from '../controllers/chatController.js';
import {
  getAllSupportChats,
  getAdminChat,
  adminSendMessage,
  adminCloseChat,
  getChatStats,
} from '../controllers/adminChatController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Admin chat routes (must come before parameterized routes)
router.get('/admin/all', admin, getAllSupportChats);
router.get('/admin/stats', admin, getChatStats);
router.get('/admin/:chatId', admin, getAdminChat);
router.post('/admin/:chatId/send', admin, adminSendMessage);
router.patch('/admin/:chatId/close', admin, adminCloseChat);

// User chat management
router.post('/create', createChat);
router.get('/my-chats', getUserChats);
router.get('/unread-count', getUnreadCount);

// Chat messages
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/send', sendMessage);
router.patch('/:chatId/close', closeChat);

export default router;
