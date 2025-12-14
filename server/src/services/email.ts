import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  // host: process.env.EMAIL_HOST,
  // port: Number(process.env.EMAIL_PORT),
  // secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  service: 'gmail',
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
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  // BACKEND URL'sini kullan!
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'; // .env'den al veya varsayılan kullan
  // Link backend'deki /verify-email endpoint'ine işaret etmeli
  const verificationLink = `${backendUrl}/verify-email?token=${token}`; 
  const subject = 'Verify Your Email Address';
  const text = `Please verify your email address by clicking the following link: ${verificationLink}`;
  const html = `<p>Please verify your email address by clicking the link below:</p><p><a href=\"${verificationLink}\">Verify Email</a></p><p>If you did not create an account, please ignore this email.</p>`;

  await sendEmail({ to, subject, text, html });
} 