export class SMSService {
  private twilioClient: any;
  private fromNumber: string;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log("✅ Twilio SMS service initialized");
    } else {
      console.log("⚠️  Twilio credentials not configured - SMS disabled");
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
        return true;
      }

      console.log(`SMS sent to ${to}: ${message}`);
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  async sendOTP(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your Earn9ja verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendPasswordResetOTP(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    const message = `Your Earn9ja password reset code is: ${code}. Valid for 10 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendWithdrawalOTP(
    phoneNumber: string,
    code: string,
    amount: number
  ): Promise<boolean> {
    const message = `Your Earn9ja withdrawal verification code for ₦${amount} is: ${code}. Valid for 10 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }
}

export const smsService = new SMSService();
