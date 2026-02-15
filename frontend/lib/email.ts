// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type EmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; path: string }[];
};

export async function sendEmail({ to, subject, text, html, attachments }: EmailOptions) {
  console.log(`[DEBUG] Attempting to send email to: ${to}`);
  console.log(`[DEBUG] SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} User=${process.env.SMTP_USER || 'MISSING'}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not set (or empty string). Check .env file.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Client Happiness" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html,
      attachments
    });
    console.log('✅ Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}
