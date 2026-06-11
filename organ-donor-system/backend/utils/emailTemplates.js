const welcomeDonorTemplate = (donorName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon">❤️</div>
    <h1>Welcome to Organ Donor System!</h1>
  </div>
  <div class="content">
    <h2>Hello ${donorName},</h2>
    <p>Thank you for registering as an organ donor! Your decision to save lives is truly noble and inspiring.</p>
    
    <p><strong>What happens next?</strong></p>
    <ul>
      <li>✅ Complete your donor profile with medical details</li>
      <li>✅ Upload your ID proof for verification</li>
      <li>✅ Our team will verify your documents</li>
      <li>✅ Once verified, you'll be an active donor</li>
    </ul>
    
    <p>One organ donor can save up to <strong>8 lives</strong> and enhance many more through tissue donation.</p>
    
    <a href="${process.env.CLIENT_URL}/donor/dashboard" class="button">Complete Your Profile</a>
    
    <p>If you have any questions, feel free to contact our support team.</p>
    
    <p>With gratitude,<br><strong>Organ Donor System Team</strong></p>
  </div>
  <div class="footer">
    <p>This email was sent to you because you registered at Organ Donor System.</p>
    <p>&copy; ${new Date().getFullYear()} Organ Donor System. All rights reserved.</p>
  </div>
</body>
</html>
`;

const verificationSuccessTemplate = (donorName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .success-badge {
      background: #10b981;
      color: white;
      padding: 10px 20px;
      border-radius: 50px;
      display: inline-block;
      margin: 20px 0;
      font-weight: bold;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon">🎉</div>
    <h1>Profile Verified!</h1>
  </div>
  <div class="content">
    <h2>Congratulations ${donorName}!</h2>
    
    <div class="success-badge">✓ Verified Donor</div>
    
    <p>Your donor profile has been successfully verified by our team. You are now an <strong>active organ donor</strong>!</p>
    
    <p><strong>Your Impact:</strong></p>
    <ul>
      <li>💝 You can save up to 8 lives</li>
      <li>👁️ Restore sight through cornea donation</li>
      <li>🦴 Help others through tissue donation</li>
      <li>❤️ Give hope to families waiting for transplants</li>
    </ul>
    
    <p>Thank you for your incredible generosity. You are a true hero!</p>
    
    <p>Best regards,<br><strong>Organ Donor System Team</strong></p>
  </div>
</body>
</html>
`;

const matchFoundTemplate = (donorName, organType, hospitalName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .highlight {
      background: #dbeafe;
      padding: 15px;
      border-left: 4px solid #3b82f6;
      margin: 20px 0;
      border-radius: 4px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon">💝</div>
    <h1>Match Found!</h1>
  </div>
  <div class="content">
    <h2>Dear ${donorName},</h2>
    
    <p>We have found a potential match for your registered organ donation.</p>
    
    <div class="highlight">
      <strong>Match Details:</strong><br>
      Organ: <strong>${organType}</strong><br>
      Hospital: <strong>${hospitalName}</strong>
    </div>
    
    <p>Our team will contact you shortly with more information about the next steps.</p>
    
    <p>Your decision to donate is giving someone a second chance at life. Thank you for your incredible generosity!</p>
    
    <p>Warm regards,<br><strong>Organ Donor System Team</strong></p>
  </div>
</body>
</html>
`;

const hospitalVerifiedTemplate = (hospitalName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon">🏥</div>
    <h1>Hospital Verified!</h1>
  </div>
  <div class="content">
    <h2>Dear ${hospitalName} Team,</h2>
    
    <p>Your hospital registration has been successfully verified!</p>
    
    <p><strong>You can now:</strong></p>
    <ul>
      <li>✅ Create organ requests</li>
      <li>✅ Search for matching donors</li>
      <li>✅ Track request status</li>
      <li>✅ Access donor information (privacy-protected)</li>
    </ul>
    
    <p>Thank you for partnering with us to save lives!</p>
    
    <p>Best regards,<br><strong>Organ Donor System Team</strong></p>
  </div>
</body>
</html>
`;

const requestMatchedTemplate = (hospitalName, organType, patientAge) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .highlight {
      background: #d1fae5;
      padding: 15px;
      border-left: 4px solid #10b981;
      margin: 20px 0;
      border-radius: 4px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon">✅</div>
    <h1>Match Found for Your Request!</h1>
  </div>
  <div class="content">
    <h2>Dear ${hospitalName} Team,</h2>
    
    <p>Great news! We have found potential donor matches for your organ request.</p>
    
    <div class="highlight">
      <strong>Request Details:</strong><br>
      Organ: <strong>${organType}</strong><br>
      Patient Age: <strong>${patientAge} years</strong>
    </div>
    
    <p>Please log in to your dashboard to view the matched donors and proceed with the next steps.</p>
    
    <p>Time is critical. Please review the matches as soon as possible.</p>
    
    <p>Best regards,<br><strong>Organ Donor System Team</strong></p>
  </div>
</body>
</html>
`;

module.exports = {
    welcomeDonorTemplate,
    verificationSuccessTemplate,
    matchFoundTemplate,
    hospitalVerifiedTemplate,
    requestMatchedTemplate,
};
