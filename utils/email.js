export const generateOtpEmailTemplate = (otp, userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      text-align: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .email-header h1 {
      font-size: 24px;
      color: #333;
      margin: 0;
    }
    .email-body {
      text-align: center;
      color: #555;
    }
    .otp {
      font-size: 32px;
      font-weight: bold;
      color: #1a73e8;
      margin: 20px 0;
    }
    .email-footer {
      text-align: center;
      font-size: 14px;
      color: #999;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>OTP Verification</h1>
    </div>
    <div class="email-body">
      <p>Hello ${userName},</p>
      <p>Use the OTP below to complete your verification:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for the next 5 minutes. Do not share it with anyone.</p>
    </div>
    <div class="email-footer">
      <p>Thank you for using Bold Data!</p>
      <p>&copy; ${new Date().getFullYear()} Bold Data. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const generatePasswordResetEmailTemplate = (
  otp,
  userName
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #4CAF50;
        color: white;
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        color: #333333;
      }
      .content p {
        line-height: 1.6;
        margin: 10px 0;
      }
      .otp {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        background-color: #f9f9f9;
        padding: 10px;
        border: 1px dashed #4CAF50;
        margin: 20px 0;
        border-radius: 4px;
      }
      .footer {
        text-align: center;
        background-color: #f9f9f9;
        padding: 15px;
        font-size: 14px;
        color: #888888;
        border-top: 1px solid #dddddd;
      }
      .footer a {
        color: #4CAF50;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>Hi, ${userName}</p>
        <p>We received a request to reset your password. Use the OTP below to proceed with resetting your password. This OTP is valid for the next 5 minutes.</p>
        <div class="otp">${otp}</div>
        <p>If you did not request this, please ignore this email or contact our support team if you have any concerns.</p>
        <p>Thank you,<br>The Bold Data Team</p>
      </div>
      <div class="footer">
        <p>If you need assistance, please <a href="mailto:support@bolddata.com">contact us</a>.</p>
        <p>&copy; ${new Date().getFullYear()} Bold Data. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

export const generateTransactionReceipt = (
  user,
  transaction
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Receipt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #4CAF50;
    }
    .details {
      margin: 20px 0;
    }
    .details p {
      margin: 10px 0;
    }
    .details span {
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #4CAF50;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Transaction Receipt</h1>
    </div>

    <div class="details">
      <p><span>Type:</span> ${transaction.serviceType}</p>
      <p><span>Amount:</span> ${transaction.amount}</p>
      <p><span>Status:</span> ${transaction.status}</p>
      <p><span>Reference:</span> ${transaction.reference}</p>
      <p><span>Date:</span> ${transaction.createdAt}</p>
    </div>
    <div class="footer">
      <p>Thank you for using our service, ${user.firstName}!</p>
      <p>If you have any questions, contact our support team at <a href="mailto:support@bolddata.com">support@bolddata.com</a>.</p>
      <p>&copy; ${new Date().getFullYear()} Bold Data. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>
`;
