import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Earn9ja <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("✅ Email sent successfully:", data?.id);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

export default { sendEmail };
