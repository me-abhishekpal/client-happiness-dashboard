// lib/notifications.ts

import { sendEmail } from '@/lib/email';

type NotificationPayload = {
  type: 'RED_ALERT' | 'STATUS_CHANGE';
  clientName: string;
  oldStatus: string;
  newStatus: string;
  user: string;
  comments?: string;
  recipients: string[]; // Email addresses
};

export async function sendNotification(payload: NotificationPayload) {
  console.log(`[NOTIFICATION] Processing ${payload.type} for ${payload.clientName}...`);

  // 1. EMAIL NOTIFICATION (REAL via SMTP)
  if (payload.recipients.length > 0) {
    try {
      await sendEmail({
        to: payload.recipients,
        subject: payload.type === 'RED_ALERT' 
          ? `🚨 ALERT: ${payload.clientName} is now RED` 
          : `Status Update: ${payload.clientName} (${payload.newStatus})`,
        text: `
          Client: ${payload.clientName}
          New Status: ${payload.newStatus}
          Previous: ${payload.oldStatus}
          Updated By: ${payload.user}
          
          Comments:
          ${payload.comments || 'No comments provided.'}
        `,
        html: `
          <h2>Status Update: ${payload.clientName}</h2>
          <p><strong>Status:</strong> <span style="color:${payload.newStatus === 'RED' ? 'red' : 'green'}">${payload.newStatus}</span></p>
          <p><strong>Updated By:</strong> ${payload.user}</p>
          <hr/>
          <p><strong>Comments:</strong></p>
          <blockquote style="background:#f9f9f9; padding:10px; border-left:5px solid #ccc;">
            ${payload.comments || 'No comments provided.'}
          </blockquote>
        `
      });
    } catch (err) {
      console.error('Failed to send email notification:', err);
    }
  }

  // 2. TEAMS NOTIFICATION (Still Mock for now)
  // In production, you'd fetch(TEAMS_WEBHOOK_URL, { body: ... })
  if (payload.newStatus === 'RED') {
    console.log(`🚨 TEAMS ALERT: ${payload.clientName} is now RED!`);
  }
  
  return true;
}
