const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Strip spaces from App Password (Gmail App Passwords sometimes copied with spaces)
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,           // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass,
    },
    tls: {
      rejectUnauthorized: false,  // avoids self-signed cert errors in local dev
    },
  });

  const message = {
    from: `"${process.env.FROM_NAME || 'VSSUT Esports'}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    ...(options.html && { html: options.html }),
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email sent to ${options.email} | MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email failed to ${options.email}:`);
    console.error(`   Code   : ${err.code}`);
    console.error(`   Message: ${err.message}`);
    throw err;  // re-throw so caller can respond with 500
  }
};

module.exports = sendEmail;
