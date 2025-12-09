import Chat from '../models/Chat.js';
import User from '../models/User.js';

// Get all support chats (admin only)
export const getAllSupportChats = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const chats = await Chat.find({
      type: 'customer-support',
      ...(status && { status }),
    })
      .populate('participants.user', 'name email')
      .sort('-lastMessageAt');

    res.status(200).json({
      status: 'success',
      data: { chats },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get specific chat (admin)
export const getAdminChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'name email');

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { chat },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Admin send message to customer
export const adminSendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const adminId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Message cannot be empty',
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Check if admin is already a participant, if not add them
    const isParticipant = chat.participants.some(
      p => p.user.toString() === adminId.toString()
    );

    if (!isParticipant) {
      chat.participants.push({
        user: adminId,
        role: 'support',
      });
    }

    chat.messages.push({
      sender: adminId,
      senderType: 'support',
      message: message.trim(),
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    await chat.populate('participants.user', 'name email');

    res.status(200).json({
      status: 'success',
      data: { chat },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Admin close chat
export const adminCloseChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.status(200).json({
      status: 'success',
      message: 'Chat closed successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const activeChats = await Chat.countDocuments({
      type: 'customer-support',
      status: 'active',
    });

    const closedChats = await Chat.countDocuments({
      type: 'customer-support',
      status: 'closed',
    });

    // Get chats with unread messages from customers
    const allChats = await Chat.find({
      type: 'customer-support',
      status: 'active',
    });

    let unreadCount = 0;
    allChats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.senderType === 'customer' && !msg.isRead) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({
      status: 'success',
      data: {
        activeChats,
        closedChats,
        unreadMessages: unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
