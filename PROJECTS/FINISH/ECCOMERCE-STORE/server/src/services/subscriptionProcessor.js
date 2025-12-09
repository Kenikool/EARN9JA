import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { sendEmail } from '../utils/emailService.js';

export class SubscriptionProcessor {
  async processDueSubscriptions() {
    console.log('🔄 Starting subscription processing...');
    
    const now = new Date();
    const dueSubscriptions = await Subscription.find({
      status: 'active',
      nextDelivery: { $lte: now },
    }).populate('product user');

    console.log(`Found ${dueSubscriptions.length} subscriptions due for processing`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const subscription of dueSubscriptions) {
      try {
        await this.processSubscription(subscription);
        results.successful++;
      } catch (error) {
        console.error(`Failed to process subscription ${subscription._id}:`, error);
        results.failed++;
        results.errors.push({
          subscriptionId: subscription._id,
          error: error.message,
        });
        
        // Record failure
        await subscription.recordFailure(error.message);
        
        // Notify user of failure
        await this.notifyPaymentFailure(subscription, error.message);
      }
    }

    console.log(`✅ Processing complete: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  async processSubscription(subscription) {
    console.log(`Processing subscription ${subscription._id} for user ${subscription.user.email}`);

    // Check if product is still available
    const product = await Product.findById(subscription.product._id);
    if (!product) {
      throw new Error('Product no longer available');
    }

    if (product.stock < subscription.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Required: ${subscription.quantity}`);
    }

    // Calculate discounted price
    const discountedPrice = subscription.price * (1 - subscription.discount / 100);
    const totalAmount = discountedPrice * subscription.quantity;

    // Try to charge using wallet first
    let paymentMethod = 'wallet';
    let paymentSuccessful = false;

    try {
      const wallet = await Wallet.findOne({ user: subscription.user._id });
      if (wallet && wallet.balance >= totalAmount) {
        await wallet.deductFunds(
          totalAmount,
          `Subscription payment for ${product.name}`,
          `SUB-${subscription._id}-${Date.now()}`
        );
        paymentSuccessful = true;
        console.log(`✓ Charged $${totalAmount} from wallet`);
      }
    } catch (error) {
      console.log('Wallet payment failed, will need manual payment');
    }

    // Create order
    const order = await Order.create({
      user: subscription.user._id,
      items: [{
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: discountedPrice,
        quantity: subscription.quantity,
      }],
      shippingAddress: subscription.deliveryAddress,
      paymentMethod,
      itemsPrice: totalAmount,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: totalAmount,
      isPaid: paymentSuccessful,
      paidAt: paymentSuccessful ? new Date() : null,
      isSubscription: true,
      subscriptionId: subscription._id,
    });

    // Update product stock
    product.stock -= subscription.quantity;
    await product.save();

    // Record delivery in subscription
    await subscription.recordDelivery(order);

    // Update next delivery date
    subscription.nextDelivery = subscription.calculateNextDelivery();
    await subscription.save();

    // Send confirmation email
    await this.notifyDeliveryCreated(subscription, order);

    console.log(`✓ Created order ${order.orderNumber} for subscription ${subscription._id}`);

    return order;
  }

  async notifyDeliveryCreated(subscription, order) {
    try {
      const emailContent = `
        <h2>Your Subscription Order is On Its Way! 📦</h2>
        <p>Hi ${subscription.user.name},</p>
        <p>Great news! Your subscription order has been created and will be shipped soon.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Product:</strong> ${subscription.product.name}</p>
          <p><strong>Quantity:</strong> ${subscription.quantity}</p>
          <p><strong>Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
          <p><strong>Discount:</strong> ${subscription.discount}% off (Subscription Savings!)</p>
        </div>

        <p><strong>Next Delivery:</strong> ${new Date(subscription.nextDelivery).toLocaleDateString()}</p>
        
        <p>You can manage your subscription anytime from your account dashboard.</p>
        
        <p>Thank you for subscribing!</p>
      `;

      await sendEmail({
        to: subscription.user.email,
        subject: `Subscription Order Created - ${order.orderNumber}`,
        html: emailContent,
      });
    } catch (error) {
      console.error('Failed to send delivery notification:', error);
    }
  }

  async notifyPaymentFailure(subscription, reason) {
    try {
      const emailContent = `
        <h2>Subscription Payment Failed ⚠️</h2>
        <p>Hi ${subscription.user.name},</p>
        <p>We were unable to process payment for your subscription.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Subscription Details</h3>
          <p><strong>Product:</strong> ${subscription.product.name}</p>
          <p><strong>Amount:</strong> $${(subscription.price * subscription.quantity * (1 - subscription.discount / 100)).toFixed(2)}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Failed Attempts:</strong> ${subscription.failedAttempts}/3</p>
        </div>

        ${subscription.failedAttempts >= 3 ? `
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>⚠️ Subscription Cancelled</strong></p>
            <p>Your subscription has been cancelled after 3 failed payment attempts.</p>
          </div>
        ` : `
          <p>Please update your payment method or add funds to your wallet to continue your subscription.</p>
          <p>We'll try again on the next scheduled delivery date.</p>
        `}
        
        <p><a href="${process.env.CLIENT_URL}/subscriptions" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage Subscription</a></p>
      `;

      await sendEmail({
        to: subscription.user.email,
        subject: 'Subscription Payment Failed - Action Required',
        html: emailContent,
      });
    } catch (error) {
      console.error('Failed to send payment failure notification:', error);
    }
  }

  async notifyUpcomingDelivery(subscription) {
    try {
      const daysUntilDelivery = Math.ceil((new Date(subscription.nextDelivery) - new Date()) / (1000 * 60 * 60 * 24));
      
      const emailContent = `
        <h2>Upcoming Subscription Delivery 📅</h2>
        <p>Hi ${subscription.user.name},</p>
        <p>Your next subscription delivery is coming up in ${daysUntilDelivery} days!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Details</h3>
          <p><strong>Product:</strong> ${subscription.product.name}</p>
          <p><strong>Quantity:</strong> ${subscription.quantity}</p>
          <p><strong>Scheduled Date:</strong> ${new Date(subscription.nextDelivery).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> $${(subscription.price * subscription.quantity * (1 - subscription.discount / 100)).toFixed(2)}</p>
        </div>

        <p>Want to make changes? You can skip, pause, or modify your subscription anytime.</p>
        
        <p><a href="${process.env.CLIENT_URL}/subscriptions" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage Subscription</a></p>
      `;

      await sendEmail({
        to: subscription.user.email,
        subject: `Upcoming Delivery - ${subscription.product.name}`,
        html: emailContent,
      });
    } catch (error) {
      console.error('Failed to send upcoming delivery notification:', error);
    }
  }

  async sendUpcomingDeliveryReminders() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingSubscriptions = await Subscription.find({
      status: 'active',
      nextDelivery: {
        $gte: new Date(),
        $lte: threeDaysFromNow,
      },
    }).populate('product user');

    console.log(`Sending reminders for ${upcomingSubscriptions.length} upcoming deliveries`);

    for (const subscription of upcomingSubscriptions) {
      try {
        await this.notifyUpcomingDelivery(subscription);
      } catch (error) {
        console.error(`Failed to send reminder for subscription ${subscription._id}:`, error);
      }
    }
  }
}

// Helper function to send emails (placeholder - implement with your email service)
async function sendEmail({ to, subject, html }) {
  // TODO: Implement with your email service (SendGrid, AWS SES, etc.)
  console.log(`📧 Email sent to ${to}: ${subject}`);
  // For now, just log. In production, use actual email service
}

export default new SubscriptionProcessor();
