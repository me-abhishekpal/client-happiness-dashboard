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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not set. Email skipped.');
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
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
