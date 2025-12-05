import { Resend } from "resend";

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private initialized = false;

  constructor() {
    this.fromEmail = "Earn9ja <onboarding@resend.dev>";
  }

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail =
      process.env.EMAIL_FROM || "Earn9ja <onboarding@resend.dev>";

    console.log("🔍 Email Config Check:");
    console.log("  RESEND_API_KEY:", apiKey ? "***SET***" : "NOT SET");
    console.log("  EMAIL_FROM:", this.fromEmail);

    if (apiKey) {
      this.resend = new Resend(apiKey);
      console.log("✅ Email service initialized with Resend");
    } else {
      console.log("⚠️  Resend API key not configured - Email disabled");
      console.log("⚠️  Set RESEND_API_KEY in .env");
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    this.initialize();

    try {
      if (!this.resend) {
        console.log(`⚠️  [Email Mock] To: ${to}, Subject: ${subject}`);
        console.log(
          "⚠️  Email service not configured. Set RESEND_API_KEY in .env"
        );
        return true; // Return true in dev mode to allow testing
      }

      console.log(`📧 Attempting to send email to ${to}...`);

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("❌ Resend API error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`📬 Email ID: ${data?.id}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      return false;
    }
  }

  async sendOTP(email: string, code: string): Promise<boolean> {
    const subject = "Your Earn9ja Verification Code";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: white; border: 2px dashed #00A86B; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; color: #00A86B; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Earn9ja</h1>
            <p>Earn While You Engage</p>
          </div>
          <div class="content">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <div class="otp-code">${code}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p><strong>Do not share this code with anyone.</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 Earn9ja. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetOTP(email: string, code: string): Promise<boolean> {
    const subject = "Reset Your Earn9ja Password";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: white; border: 2px dashed #00A86B; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; color: #00A86B; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Earn9ja</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Use this code:</p>
            <div class="otp-code">${code}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please secure your account immediately.</p>
          </div>
          <div class="footer">
            <p>© 2024 Earn9ja. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = "Welcome to Earn9ja!";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #FFB800; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Earn9ja!</h1>
            <p>Earn While You Engage</p>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Welcome to Earn9ja! We're excited to have you join our community.</p>
            <p>Start earning money by completing simple tasks:</p>
            <ul>
              <li>Social media engagement</li>
              <li>Music streaming</li>
              <li>Surveys and reviews</li>
              <li>Game testing</li>
              <li>Ad watching</li>
            </ul>
            <p>Get started now and earn your first ₦500!</p>
            <a href="#" class="button">Start Earning</a>
          </div>
          <div class="footer">
            <p>© 2024 Earn9ja. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
