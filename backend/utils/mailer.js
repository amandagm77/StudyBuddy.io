const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendResetCodeEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"StudyBuddy.io" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your StudyBuddy.io Password Reset Code',
    text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
  });
}

module.exports = { sendResetCodeEmail };