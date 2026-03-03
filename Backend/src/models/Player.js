const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  mobileNumber: { type: String },
  collegeName:  { type: String },
  games:        { type: [String], default: [] },
  password:     { type: String },           // stored during signup, not used for login
  role:         { type: String, default: 'player' },
  // Forgot-password OTP
  otp:          { type: String },
  otpExpires:   { type: Date },
  // Login OTP (email-only signin)
  loginOtp:         { type: String },
  loginOtpExpires:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
