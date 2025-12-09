import Chat from '../models/Chat.js';
import LoyaltyPoints from '../models/LoyaltyPoints.js';

// Create or get existing chat
export const createChat = async (req, res) => {
  try {
    const { type, vendorId } = req.body;
    const userId = req.user._id;

    // Check if user already has an active support chat
    let chat = await Chat.findOne({
      'participants.user': userId,
      type: type || 'customer-support',
      status: 'active',
      ...(vendorId && { vendor: vendorId }),
    });

    if (!chat) {
      const participants = [
        { user: userId, role: 'customer' },
      ];

      // For customer-support, we don't assign a specific support agent initially
      // Admins will see all unassigned chats and can respond to them

      if (type === 'customer-vendor' && vendorId) {
        participants.push({ user: vendorId, role: 'vendor' });
      }

      chat = await Chat.create({
        participants,
        type: type || 'customer-support',
        ...(vendorId && { vendor: vendorId }),
      });

      // Send auto-reply
      chat.messages.push({
        sender: userId, // System message
        senderType: 'support',
        message: 'Hello! Thank you for contacting us. A support agent will be with you shortly. How can we help you today?',
        isRead: false,
      });
      await chat.save();
    }

    await chat.populate('participants.user', 'name email');

    res.status(201).json({
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

// Get user's chats
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      'participants.user': userId,
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

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId,
    }).populate('participants.user', 'name email');

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) {
        msg.isRead = true;
      }
    });
    await chat.save();

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

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Message cannot be empty',
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId,
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Determine sender type
    const participant = chat.participants.find(
      p => p.user.toString() === userId.toString()
    );

    chat.messages.push({
      sender: userId,
      senderType: participant.role,
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

// Close chat
export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId,
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    chat.status = 'closed';
    await chat.save();

    // Award loyalty points for using chat
    let loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoints.create({ user: userId });
    }
    loyaltyPoints.addPoints(5, 'Chat interaction');
    await loyaltyPoints.save();

    res.status(200).json({
      status: 'success',
      message: 'Chat closed successfully',
      data: { pointsEarned: 5 },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      'participants.user': userId,
      status: 'active',
    });

    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.sender.toString() !== userId.toString() && !msg.isRead) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({
      status: 'success',
      data: { unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
