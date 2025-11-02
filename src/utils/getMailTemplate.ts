/**
 * Email template utility function
 * Provides responsive email templates for different email types
 */

import { EmailType, TemplateData } from "../types/mail";

/**
 * Get email template based on email type
 * @param type - Type of email template
 * @param data - Data to be used in the template
 * @returns HTML string of the email template
 */
export const getMailTemplate = (
  type: EmailType,
  data: TemplateData
): string => {
  // Common styles for all templates
  const commonStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Outfit, sans-serif;
    }
    body {
      background-color: #f9f9f9;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: oklch(0.6565 0.1862 39.4278);
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: oklch(0.6565 0.1862 39.4278);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
        border-radius: 0;
      }
      .content {
        padding: 20px 15px;
      }
    }
  `;

  // Switch based on email type
  switch (type) {
    case "email-verification":
      return getEmailVerificationTemplate(data, commonStyles);
    case "forgot-password":
      return getForgotPasswordTemplate(data, commonStyles);
    case "invite-member":
      return getInviteMemberTemplate(data, commonStyles);
    case "renew-workspace":
      return getRenewWorkspaceTemplate(data, commonStyles);
    default:
      throw new Error(`Email template type '${type}' not supported`);
  }
};

/**
 * Email verification template with OTP
 */
const getEmailVerificationTemplate = (
  data: TemplateData,
  commonStyles: string
): string => {
  const { username = "User", otp = "123456" } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        ${commonStyles}
        .otp-container {
          margin: 30px 0;
          text-align: center;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: oklch(0.6565 0.1862 39.4278);
          padding: 15px 25px;
          background-color: #f5f5f5;
          border-radius: 8px;
          display: inline-block;
        }
        @media only screen and (max-width: 480px) {
          .otp-code {
            font-size: 24px;
            letter-spacing: 3px;
            padding: 10px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LinkLite</div>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hello ${username},</p>
          <p>Thank you for signing up with LinkLite. To complete your registration, please use the verification code below:</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>Enter this code on the verification page to confirm your email address.</p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinkLite. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Forgot password template
 */
const getForgotPasswordTemplate = (
  data: TemplateData,
  commonStyles: string
): string => {
  const { username = "User", resetLink = "#" } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        ${commonStyles}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LinkLite</div>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This password reset link will expire in 24 hours.</p>
          <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px;">${resetLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinkLite. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Invite member template
 */
const getInviteMemberTemplate = (
  data: TemplateData,
  commonStyles: string
): string => {
  const { workspaceName = "Our Workspace", inviteLink = "#" } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Been Invited</title>
      <style>
        ${commonStyles}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LinkLite</div>
        </div>
        <div class="content">
          <h2>You've Been Invited to Join a Workspace</h2>
          <p>Hello,</p>
          <p>You have been invited to join <strong>${workspaceName}</strong> on LinkLite. Click the button below to accept the invitation and join the workspace:</p>
          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Accept Invitation</a>
          </div>
          <p>If you don't have a LinkLite account yet, you'll be able to create one after clicking the button.</p>
          <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px;">${inviteLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinkLite. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Renew workspace template
 */
const getRenewWorkspaceTemplate = (
  data: TemplateData,
  commonStyles: string
): string => {
  const {
    username = "User",
    workspaceName = "Your Workspace",
    billingDate = "N/A",
    expiryDate = "N/A",
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workspace Renewal Reminder</title>
      <style>
        ${commonStyles}
        .info-box {
          background-color: #f5f5f5;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .info-label {
          font-weight: bold;
          min-width: 140px;
        }
        @media only screen and (max-width: 480px) {
          .info-row {
            flex-direction: column;
            margin-bottom: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LinkLite</div>
        </div>
        <div class="content">
          <h2>Workspace Renewal Reminder</h2>
          <p>Hello ${username},</p>
          <p>This is a reminder that your workspace <strong>${workspaceName}</strong> subscription is due for renewal soon.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Workspace:</span>
              <span>${workspaceName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Billing Date:</span>
              <span>${billingDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Expiry Date:</span>
              <span>${expiryDate}</span>
            </div>
          </div>
          
          <p>To ensure uninterrupted access to your workspace and data, please make sure your payment method is up to date.</p>
          <div style="text-align: center;">
            <a href="#" class="button">Manage Subscription</a>
          </div>
          <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinkLite. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
