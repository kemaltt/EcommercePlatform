import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  const subject = "Verify Your Email Address";
  const text = `Your verification code is: ${token}. This code will expire in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">Welcome to ShopEase!</h2>
      <p>Please use the following code to verify your email address:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
        ${token}
      </div>
      <p>This code will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}
