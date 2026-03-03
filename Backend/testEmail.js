/**
 * Run: node testEmail.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const TARGET_EMAIL = 'nahakaditya344@gmail.com';
const OTP = Math.floor(100000 + Math.random() * 900000).toString();

const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

console.log('📧 Sending OTP test email...');
console.log('   From :', process.env.EMAIL_USER);
console.log('   To   :', TARGET_EMAIL);
console.log('   OTP  :', OTP);
console.log('');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass,
  },
  tls: { rejectUnauthorized: false },
});

const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0d0d0d;color:#fff;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#646cff,#535bf2);padding:28px 32px;text-align:center">
      <h1 style="margin:0;font-size:1.6rem;letter-spacing:1px">VSSUT Esports</h1>
      <p style="margin:4px 0 0;opacity:.8;font-size:.9rem">Account Verification</p>
    </div>
    <div style="padding:32px">
      <p>Hi <strong>Aditya</strong>,</p>
      <p>Use the OTP below to complete your sign-up. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:28px 0">
        <span style="display:inline-block;background:rgba(100,108,255,.15);border:1px solid rgba(100,108,255,.5);border-radius:10px;padding:18px 40px;font-size:2.4rem;font-weight:700;letter-spacing:10px;color:#a5b4fc">${OTP}</span>
      </div>
      <p style="color:#888;font-size:.85rem">If you did not request this, please ignore this email.</p>
    </div>
    <div style="text-align:center;padding:16px;border-top:1px solid rgba(255,255,255,.08);color:#555;font-size:.8rem">
      &copy; ${new Date().getFullYear()} VSSUT Esports. All rights reserved.
    </div>
  </div>
`;

transporter.sendMail({
  from: `"${process.env.FROM_NAME || 'VSSUT Esports'}" <${process.env.EMAIL_USER}>`,
  to: TARGET_EMAIL,
  subject: '🎮 Your VSSUT Esports Signup OTP',
  text: `Your signup OTP is: ${OTP}. It expires in 10 minutes.`,
  html,
}, (err, info) => {
  if (err) {
    console.error('❌ Failed to send email!');
    console.error('   Code   :', err.code);
    console.error('   Message:', err.message);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('   MessageId:', info.messageId);
    console.log(`   Check inbox: ${TARGET_EMAIL}`);
  }
});
