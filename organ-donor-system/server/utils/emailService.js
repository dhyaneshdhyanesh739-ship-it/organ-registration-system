const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Organ Donor System" <${process.env.EMAIL_USER || 'noreply@organdonor.com'}>`,
      to,
      subject,
      html,
      text,
    };

    // If EMAIL_USER is still the default placeholder, skip real sending and log to console
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log('========== EMAIL (DEMO MODE) ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('-------------------------------------------');
      console.log(text || 'HTML Content (check console for details)');
      if (html && html.includes('font-size: 32px')) {
        const otpMatch = html.match(/<div.*?>\s*(\d{6})\s*<\/div>/);
        if (otpMatch) console.log(`🔑 OTP: ${otpMatch[1]}`);
      }
      console.log('===========================================');
      return { messageId: 'demo-mode' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);

    // In development/test mode, don't throw error, just log it
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Development Mode: Proceeding despite email failure.');
      console.log('========== EMAIL BACKUP (CONSOLE) ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('============================================');
      return { messageId: 'fail-safe-mode' };
    }

    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email to donor
 */
const sendDonorWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Organ Donor Registration System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e11d48;">Welcome, ${name}! 🫀</h2>
      <p>Thank you for registering as an organ donor. Your decision can save lives!</p>
      <p>Your profile is currently under review. Once verified, you'll be able to:</p>
      <ul>
        <li>Manage your organ donation preferences</li>
        <li>Update your medical information</li>
        <li>Track your donation status</li>
      </ul>
      <p>We'll notify you once your profile is verified.</p>
      <p style="margin-top: 30px;">Best regards,<br/>Organ Donor System Team</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, name, role) => {
  const subject = 'Profile Verified - Organ Donor System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Profile Verified! ✅</h2>
      <p>Dear ${name},</p>
      <p>Your ${role} profile has been successfully verified.</p>
      <p>You can now access all features of the platform.</p>
      <a href="${process.env.CLIENT_URL}/login" 
         style="display: inline-block; padding: 12px 24px; background-color: #e11d48; 
                color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Login to Dashboard
      </a>
      <p style="margin-top: 30px;">Best regards,<br/>Organ Donor System Team</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Send organ request notification to hospital
 */
const sendOrganRequestNotification = async (email, hospitalName, organType, requestId) => {
  const subject = 'New Organ Request Created';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Organ Request Created</h2>
      <p>Dear ${hospitalName},</p>
      <p>Your request for <strong>${organType}</strong> has been successfully created.</p>
      <p>Request ID: <strong>${requestId}</strong></p>
      <p>Our system is now searching for compatible donors. You'll be notified when matches are found.</p>
      <a href="${process.env.CLIENT_URL}/hospital/requests" 
         style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; 
                color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        View Request Status
      </a>
      <p style="margin-top: 30px;">Best regards,<br/>Organ Donor System Team</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Send match found notification
 */
const sendMatchFoundNotification = async (email, hospitalName, organType, matchCount) => {
  const subject = 'Potential Donors Found!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Potential Donors Found! 🎯</h2>
      <p>Dear ${hospitalName},</p>
      <p>We found <strong>${matchCount}</strong> potential donor(s) for your <strong>${organType}</strong> request.</p>
      <p>Please log in to your dashboard to review the matches and take further action.</p>
      <a href="${process.env.CLIENT_URL}/hospital/requests" 
         style="display: inline-block; padding: 12px 24px; background-color: #10b981; 
                color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        View Matches
      </a>
      <p style="margin-top: 30px;">Best regards,<br/>Organ Donor System Team</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp) => {
  const subject = 'Verification Code - Organ Donor System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: #e11d48; text-align: center;">Verification Code</h2>
      <p>Dear User,</p>
      <p>Thank you for choosing Organ Donor System. Use the following OTP to complete your registration process. This OTP is valid for 10 minutes.</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you did not request this code, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Best regards,<br/>Organ Donor System Team</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendDonorWelcomeEmail,
  sendVerificationEmail,
  sendOrganRequestNotification,
  sendMatchFoundNotification,
  sendOTPEmail,
};
