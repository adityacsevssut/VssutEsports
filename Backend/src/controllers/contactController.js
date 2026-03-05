const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');

// Cache for OTPs, expires in 5 minutes (300 seconds)
const otpCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured service
    auth: {
        user: process.env.EMAIL_USER || 'devlopervssutesports@gmail.com', // fallback or real email
        // App password for the sending email needs to be configured in .env
        pass: process.env.EMAIL_PASS
    }
});

// @desc    Send OTP to organizer email
// @route   POST /api/contact/send-otp
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in cache
        otpCache.set(email, otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'VSSUT Esports - Organize Tournament Verification OTP',
            text: `Your OTP to verify your email for organizing a tournament is: ${otp}\nThis OTP is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

// @desc    Verify OTP and Submit Organizing Form
// @route   POST /api/contact/submit
const submitForm = async (req, res) => {
    try {
        const { 
            teamName, 
            gameBranch, 
            email, 
            mobileNumber, 
            collegeName, 
            year, 
            regdOrAdharNumber,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const cachedOtp = otpCache.get(email);
        if (!cachedOtp) {
            return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
        }

        if (cachedOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // OTP Valid - Proceed to send email to devlopervssutesports@gmail.com
        const destEmail = 'devlopervssutesports@gmail.com';

        const mailContent = `
New Tournament Organization Request:

Team Name: ${teamName}
Game Branch: ${gameBranch}
Organizing Mail: ${email}
Mobile Number: ${mobileNumber}
College Name: ${collegeName}
Year: ${year}
Regd/Aadhar Number: ${regdOrAdharNumber}
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destEmail,
            subject: `New Tournament Organize Request - ${teamName}`,
            text: mailContent
        };

        await transporter.sendMail(mailOptions);

        // Clear OTP after successful submission
        otpCache.del(email);

        res.status(200).json({ success: true, message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Submit Contact Form Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit form' });
    }
};

module.exports = {
    sendOtp,
    submitForm
};
