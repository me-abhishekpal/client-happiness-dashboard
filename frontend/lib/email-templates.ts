// lib/email-templates.ts

interface InviteEmailParams {
    userName: string;
    inviteToken: string;
    invitedByName?: string;
    baseUrl: string;
}

export function generateInviteEmail({ userName, inviteToken, invitedByName, baseUrl }: InviteEmailParams) {
    const setupLink = `${baseUrl}/setup-password?token=${inviteToken}`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Client Happiness Dashboard</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            
                            <!-- Header with Gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                        ✨ Welcome to Client Happiness
                                    </h1>
                                    <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                        Your account is ready to activate
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                        Hi <strong>${userName}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                        ${invitedByName ? `<strong>${invitedByName}</strong> has invited you to join the` : 'You have been invited to'} <strong>Client Happiness Dashboard</strong> – a real-time RAG status tracker for enterprise client management.
                                    </p>
                                    
                                    <p style="margin: 0 0 30px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                        To get started, please set up your password by clicking the button below:
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 10px 0 30px;">
                                                <a href="${setupLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                                    Set Up Your Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Security Note -->
                                    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin: 0 0 30px;">
                                        <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.5;">
                                            🔒 <strong>Security Note:</strong> This invitation link is valid for 24 hours and can only be used once. If you didn't expect this invitation, please ignore this email.
                                        </p>
                                    </div>
                                    
                                    <!-- Alternative Link -->
                                    <p style="margin: 0 0 10px; color: #86868b; font-size: 14px; line-height: 1.5;">
                                        If the button doesn't work, copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0 0 30px; word-break: break-all;">
                                        <a href="${setupLink}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                                            ${setupLink}
                                        </a>
                                    </p>
                                    
                                    <!-- What's Next -->
                                    <h2 style="margin: 30px 0 16px; color: #1d1d1f; font-size: 20px; font-weight: 600;">
                                        What you can do with Client Happiness:
                                    </h2>
                                    <ul style="margin: 0; padding-left: 24px; color: #1d1d1f; font-size: 15px; line-height: 1.8;">
                                        <li>Monitor client health with real-time RAG status indicators</li>
                                        <li>Track escalations and maintain detailed audit trails</li>
                                        <li>Analyze trends with interactive charts and dashboards</li>
                                        <li>Manage client relationships and accountability</li>
                                    </ul>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 8px; color: #86868b; font-size: 13px;">
                                        Need help? Contact your system administrator
                                    </p>
                                    <p style="margin: 0; color: #86868b; font-size: 12px;">
                                        © ${new Date().getFullYear()} Client Happiness Dashboard. Built with ⚡ by Antigravity
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const text = `
Welcome to Client Happiness Dashboard!

Hi ${userName},

${invitedByName ? `${invitedByName} has invited you to join the Client Happiness Dashboard` : 'You have been invited to the Client Happiness Dashboard'} – a real-time RAG status tracker for enterprise client management.

To get started, please set up your password by visiting this link:
${setupLink}

This invitation link is valid for 24 hours and can only be used once.

What you can do with Client Happiness:
- Monitor client health with real-time RAG status indicators
- Track escalations and maintain detailed audit trails
- Analyze trends with interactive charts and dashboards
- Manage client relationships and accountability

If you didn't expect this invitation, please ignore this email.

Need help? Contact your system administrator.

© ${new Date().getFullYear()} Client Happiness Dashboard
    `.trim();

    return { html, text };
}

export function generatePasswordResetEmail(userName: string, resetToken: string, baseUrl: string) {
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                        🔐 Password Reset
                                    </h1>
                                    <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                        We received a request to reset your password
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                        Hi <strong>${userName}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 30px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                        Click the button below to reset your password. This link will expire in 1 hour.
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 10px 0 30px;">
                                                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Security Note -->
                                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin: 0 0 20px;">
                                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                            ⚠️ <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact your administrator if you're concerned about account security.
                                        </p>
                                    </div>
                                    
                                    <!-- Alternative Link -->
                                    <p style="margin: 0 0 10px; color: #86868b; font-size: 14px; line-height: 1.5;">
                                        Or copy and paste this link:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${resetLink}" style="color: #f5576c; text-decoration: none; font-size: 14px;">
                                            ${resetLink}
                                        </a>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0; color: #86868b; font-size: 12px;">
                                        © ${new Date().getFullYear()} Client Happiness Dashboard
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const text = `
Password Reset Request

Hi ${userName},

We received a request to reset your password for Client Happiness Dashboard.

Click this link to reset your password (valid for 1 hour):
${resetLink}

If you didn't request this, please ignore this email or contact your administrator.

© ${new Date().getFullYear()} Client Happiness Dashboard
    `.trim();

    return { html, text };
}
