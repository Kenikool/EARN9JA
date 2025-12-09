import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplates } from "../utils/emailTemplates.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// @desc    Send order confirmation email
// @route   POST /api/notifications/order-confirmation
// @access  Private
export const sendOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      throw new Error('Order not found');
    }

    const user = order.user;
    const emailContent = emailTemplates.orderConfirmation(order, user);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Order confirmation email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Send order confirmation error:', error);
    throw error;
  }
};

// @desc    Send order shipped email
// @route   POST /api/notifications/order-shipped
// @access  Private
export const sendOrderShipped = async (orderId, trackingNumber) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      throw new Error('Order not found');
    }

    const user = order.user;
    const emailContent = emailTemplates.orderShipped(order, user, trackingNumber);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Order shipped email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Send order shipped error:', error);
    throw error;
  }
};

// @desc    Send order delivered email
// @route   POST /api/notifications/order-delivered
// @access  Private
export const sendOrderDelivered = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      throw new Error('Order not found');
    }

    const user = order.user;
    const emailContent = emailTemplates.orderDelivered(order, user);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Order delivered email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Send order delivered error:', error);
    throw error;
  }
};

// @desc    Send low stock alert to admins
// @route   POST /api/notifications/low-stock
// @access  Private
export const sendLowStockAlert = async (product, currentStock) => {
  try {
    // Get all admin users
    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } });

    const emailContent = emailTemplates.lowStockAlert(product, currentStock);

    // Send email to all admins
    const emailPromises = admins.map(admin =>
      sendEmail({
        to: admin.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
    );

    await Promise.all(emailPromises);

    console.log(`Low stock alert sent to ${admins.length} admins`);
    return { success: true };
  } catch (error) {
    console.error('Send low stock alert error:', error);
    throw error;
  }
};

// @desc    Send welcome email
// @route   POST /api/notifications/welcome
// @access  Public
export const sendWelcomeEmail = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const emailContent = emailTemplates.welcome(user);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Welcome email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
};
