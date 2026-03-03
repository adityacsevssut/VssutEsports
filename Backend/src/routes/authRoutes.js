const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginPlayer,
  requestSignupOtp,
  verifySignupOtp,
  requestLoginOtp,
  verifyLoginOtp,
  loginPartner,
  getPartners,
  createPartner,
  deletePartner,
  forgotPassword,
  resetPassword,
  getMe,
  getAllPlayers,
  deletePlayer,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Admin Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Player Google Login / Signup
router.post('/google', googleLogin);

// Player Signup (2-step OTP flow)
router.post('/player/signup/send-otp', requestSignupOtp);   // Step 1: collect form + send OTP
router.post('/player/signup/verify-otp', verifySignupOtp);  // Step 2: verify OTP + create account

// Player Login (email + password)
router.post('/player/login', loginPlayer);

// Player Login OTP helpers (used internally by forgot-password page if ever needed)
router.post('/player/login/send-otp', requestLoginOtp);
router.post('/player/login/verify-otp', verifyLoginOtp);

// Player Management (Developer use)
router.get('/players', getAllPlayers);
router.delete('/players/:id', deletePlayer);

// Partner Auth & Management
router.post('/partner/login', loginPartner);
router.get('/partners', getPartners);
router.post('/partners', createPartner);
router.delete('/partners/:id', deletePartner);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Get current user (Protected)
router.get('/me', protect, getMe);

module.exports = router;
