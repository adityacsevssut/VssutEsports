const mongoose = require('mongoose');

/**
 * Temporarily stores signup form data + OTP while the user
 * verifies their email. Cleared after successful verification
 * or after TTL expires (15 mins via the `createdAt` index).
 */
const pendingPlayerSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  mobileNumber: { type: String },
  collegeName:  { type: String },
  games:        { type: [String], default: [] },
  password:     { type: String },       // hashed
  otp:          { type: String, required: true },
  otpExpires:   { type: Date, required: true },
  createdAt:    { type: Date, default: Date.now, expires: '15m' },  // auto-delete
});

module.exports = mongoose.model('PendingPlayer', pendingPlayerSchema);
