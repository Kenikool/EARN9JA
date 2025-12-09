import Notification from '../models/Notification.js';

// Get admin notifications
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const query = {
      recipient: userId,
      ...(unreadOnly === 'true' && { isRead: false }),
    };

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Create notification (helper function)
export const createNotification = async (recipientId, type, title, message, link = null, data = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      data,
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Notify all admins
export const notifyAllAdmins = async (type, title, message, link = null, data = null) => {
  try {
    const User = (await import('../models/User.js')).default;
    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } });

    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type,
      title,
      message,
      link,
      data,
    }));

    await Notification.insertMany(notifications);
    return notifications;
  } catch (error) {
    console.error('Notify all admins error:', error);
    throw error;
  }
};
