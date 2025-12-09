// Email Templates for Notifications

export const emailTemplates = {
  // Order Confirmation Email
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            
            <div class="order-details">
              <h3>Order #${order.orderNumber}</h3>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Shipping Address:</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
              
              <h4>Order Items:</h4>
              ${order.items.map(item => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}
                </div>
              `).join('')}
              
              <div class="total">
                <p>Subtotal: $${order.itemsPrice.toFixed(2)}</p>
                <p>Shipping: $${order.shippingPrice.toFixed(2)}</p>
                <p>Tax: $${order.taxPrice.toFixed(2)}</p>
                <p style="color: #4F46E5;">Total: $${order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
            
            <center>
              <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="button">Track Your Order</a>
            </center>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Order Confirmed!
      
      Hi ${user.name},
      
      Thank you for your order! Order #${order.orderNumber}
      
      Order Date: ${new Date(order.createdAt).toLocaleDateString()}
      Total: $${order.totalPrice.toFixed(2)}
      
      Track your order: ${process.env.CLIENT_URL}/orders/${order._id}
    `
  }),

  // Order Shipped Email
  orderShipped: (order, user, trackingNumber) => ({
    subject: `Your Order Has Shipped - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #10B981; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.</p>
            
            <div class="tracking">
              <h3>Tracking Information</h3>
              <div class="tracking-number">${trackingNumber || 'N/A'}</div>
              <p>Estimated Delivery: ${order.estimatedDelivery || '3-5 business days'}</p>
              <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="button">Track Package</a>
            </div>
            
            <p><strong>Shipping Address:</strong><br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Your Order Has Shipped!
      
      Hi ${user.name},
      
      Your order #${order.orderNumber} has been shipped.
      Tracking Number: ${trackingNumber || 'N/A'}
      
      Track your package: ${process.env.CLIENT_URL}/orders/${order._id}
    `
  }),

  // Order Delivered Email
  orderDelivered: (order, user) => ({
    subject: `Order Delivered - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Your order #${order.orderNumber} has been delivered successfully!</p>
            <p>We hope you love your purchase. If you have any issues, please contact us within 7 days for returns or exchanges.</p>
            
            <center>
              <a href="${process.env.CLIENT_URL}/orders/${order._id}/review" class="button">Leave a Review</a>
            </center>
            
            <p>Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Order Delivered!
      
      Hi ${user.name},
      
      Your order #${order.orderNumber} has been delivered successfully!
      
      Leave a review: ${process.env.CLIENT_URL}/orders/${order._id}/review
    `
  }),

  // Low Stock Alert (Admin)
  lowStockAlert: (product, currentStock) => ({
    subject: `⚠️ Low Stock Alert - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h3>${product.name}</h3>
              <p><strong>Current Stock:</strong> ${currentStock} units</p>
              <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
              <p><strong>Category:</strong> ${product.category?.name || 'N/A'}</p>
            </div>
            
            <p>This product is running low on stock. Please restock soon to avoid going out of stock.</p>
            
            <center>
              <a href="${process.env.CLIENT_URL}/admin/products/${product._id}" class="button">Update Stock</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Low Stock Alert
      
      Product: ${product.name}
      Current Stock: ${currentStock} units
      
      Please restock soon.
    `
  }),

  // Welcome Email
  welcome: (user) => ({
    subject: 'Welcome to Our Store!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Store!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name || 'Valued Customer'},</p>
            <p>Thank you for joining us! We're excited to have you as part of our community.</p>
            <p>Start exploring our amazing products and enjoy exclusive deals.</p>
            
            <center>
              <a href="${process.env.CLIENT_URL}/shop" class="button" style="color: white;">Start Shopping</a>
            </center>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Our Store!
      
      Hi ${user.name || 'Valued Customer'},
      
      Thank you for joining us! Start shopping: ${process.env.CLIENT_URL}/shop
    `
  }),

  // Email Verification
  emailVerification: (userName, verificationLink) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Thank you for registering! Please verify your email address to complete your registration.</p>
            
            <center>
              <a href="${verificationLink}" class="button" style="color: white;">Verify Email Address</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationLink}</p>
            
            <div class="warning">
              <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            </div>
            
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Verify Your Email
      
      Hi ${userName},
      
      Please verify your email address by clicking this link:
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `
  }),

  // Coupon Announcement Email
  couponAnnouncement: (userName, coupon) => ({
    subject: `🎉 Special Offer: ${coupon.code} - Save ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .coupon-box { background: white; border: 3px dashed #667eea; border-radius: 10px; padding: 30px; margin: 20px 0; text-align: center; }
          .coupon-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; margin: 15px 0; font-family: monospace; }
          .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .details { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Exclusive Coupon Just for You!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'Valued Customer'},</p>
            <p>We have a special offer just for you! Use this coupon code to save on your next purchase.</p>
            
            <div class="coupon-box">
              <p style="margin: 0; font-size: 14px; color: #666;">YOUR COUPON CODE</p>
              <div class="coupon-code">${coupon.code}</div>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #667eea; font-weight: bold;">
                ${coupon.discountType === 'percentage' 
                  ? `${coupon.discountValue}% OFF` 
                  : `$${coupon.discountValue} OFF`}
              </p>
            </div>
            
            <div class="details">
              <p><strong>📝 Description:</strong> ${coupon.description}</p>
              ${coupon.minOrderValue > 0 ? `<p><strong>💰 Minimum Order:</strong> $${coupon.minOrderValue}</p>` : ''}
              ${coupon.maxDiscount ? `<p><strong>🎯 Maximum Discount:</strong> $${coupon.maxDiscount}</p>` : ''}
              <p><strong>⏰ Valid Until:</strong> ${new Date(coupon.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              ${coupon.usageLimit > 0 ? `<p><strong>🎫 Limited to:</strong> ${coupon.usageLimit} uses</p>` : '<p><strong>🎫 Usage:</strong> Unlimited</p>'}
            </div>
            
            <center>
              <a href="${process.env.CLIENT_URL}/shop" class="button">Shop Now</a>
            </center>
            
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
              Don't miss out! This offer won't last forever.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
            <p>You received this email because you're a valued customer.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Exclusive Coupon Just for You!
      
      Hi ${userName || 'Valued Customer'},
      
      Use coupon code: ${coupon.code}
      Save: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue}
      
      ${coupon.description}
      
      ${coupon.minOrderValue > 0 ? `Minimum Order: $${coupon.minOrderValue}` : ''}
      Valid Until: ${new Date(coupon.expiryDate).toLocaleDateString()}
      
      Shop now: ${process.env.CLIENT_URL}/shop
    `
  }),
};
