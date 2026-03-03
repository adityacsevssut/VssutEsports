const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const PendingPlayer = require('../models/PendingPlayer');
const Partner = require('../models/Partner');
const sendEmail = require('../utils/sendEmail');

// Fixed Partners Credentials
const PARTNERS = [
  { email: 'freefire@partner.com', password: 'password123', organisingId: 'FF-2024-ORG', role: 'partner_freefire', name: 'FreeFire Partner' },
  { email: 'bgmi@partner.com',     password: 'password123', organisingId: 'BG-2024-ORG', role: 'partner_bgmi',     name: 'BGMI Partner'     },
  { email: 'valorant@partner.com', password: 'password123', organisingId: 'VL-2024-ORG', role: 'partner_valorant', name: 'Valorant Partner' },
  { email: 'developer@vssut.com',  password: 'password123', organisingId: 'DEV-VSSUT-01',role: 'developer',        name: 'Developer'        },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpEmailHtml = (name, otp, subject) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0d0d0d;color:#fff;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#646cff,#535bf2);padding:28px 32px;text-align:center">
      <h1 style="margin:0;font-size:1.6rem;letter-spacing:1px">VSSUT Esports</h1>
      <p style="margin:4px 0 0;opacity:.8;font-size:.9rem">${subject}</p>
    </div>
    <div style="padding:32px">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use the OTP below. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:28px 0">
        <span style="display:inline-block;background:rgba(100,108,255,.15);border:1px solid rgba(100,108,255,.5);border-radius:10px;padding:18px 40px;font-size:2.4rem;font-weight:700;letter-spacing:10px;color:#a5b4fc">${otp}</span>
      </div>
      <p style="color:#888;font-size:.85rem">If you did not request this, please ignore this email.</p>
    </div>
    <div style="text-align:center;padding:16px;border-top:1px solid rgba(255,255,255,.08);color:#555;font-size:.8rem">
      &copy; ${new Date().getFullYear()} VSSUT Esports. All rights reserved.
    </div>
  </div>
`;

// ── Admin Auth ─────────────────────────────────────────────────────────────

// @desc    Register new user (ADMIN)
// @route   POST /api/auth/register
// @access  Public (for setup)
const registerUser = async (req, res) => {
  const { username, email, password, role, allowedGames } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username, email, password: hashedPassword,
    role: role || 'admin',
    allowedGames: allowedGames || ['all']
  });

  if (user) {
    res.status(201).json({
      _id: user.id, username: user.username, email: user.email,
      role: user.role, token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user (ADMIN)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id, username: user.username, email: user.email,
      role: user.role, allowedGames: user.allowedGames,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

// ── Player Signup (2-step: form → email OTP → account created) ─────────────

// @desc    Step 1 – Accept signup details & send OTP
// @route   POST /api/auth/player/signup/send-otp
// @access  Public
const requestSignupOtp = async (req, res) => {
  const { firstName, lastName, email, mobileNumber, collegeName, games, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Check if a verified account already exists
    const exists = await Player.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const otp = makeOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upsert pending record (replace if an earlier attempt existed)
    await PendingPlayer.findOneAndReplace(
      { email },
      { firstName, lastName, email, mobileNumber, collegeName, games, password: hashedPassword, otp, otpExpires },
      { upsert: true, new: true }
    );

    await sendEmail({
      email,
      subject: '🎮 Verify your VSSUT Esports account',
      message: `Your signup OTP is: ${otp}. It expires in 10 minutes.`,
      html: otpEmailHtml(firstName, otp, 'Account Verification'),
    });

    res.status(200).json({ message: 'OTP sent to your email', email });
  } catch (error) {
    console.error('requestSignupOtp error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Step 2 – Verify signup OTP & create account
// @route   POST /api/auth/player/signup/verify-otp
// @access  Public
const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const pending = await PendingPlayer.findOne({ email });

    if (!pending) {
      return res.status(400).json({ message: 'No pending signup found. Please start over.' });
    }
    if (pending.otpExpires < Date.now()) {
      await PendingPlayer.deleteOne({ email });
      return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    }
    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP valid → create actual Player account
    const player = await Player.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      mobileNumber: pending.mobileNumber,
      collegeName: pending.collegeName,
      games: pending.games,
      password: pending.password,
    });

    // Clean up pending record
    await PendingPlayer.deleteOne({ email });

    res.status(201).json({
      _id: player.id,
      firstName: player.firstName,
      email: player.email,
      role: 'player',
      token: generateToken(player.id, 'player'),
    });
  } catch (error) {
    console.error('verifySignupOtp error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── Player Login (email → OTP only, no password) ───────────────────────────

// @desc    Step 1 – Send login OTP (email only)
// @route   POST /api/auth/player/login/send-otp
// @access  Public
const requestLoginOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const player = await Player.findOne({ email });
    if (!player) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = makeOtp();
    player.loginOtp = otp;
    player.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await player.save();

    await sendEmail({
      email: player.email,
      subject: '🎮 Your VSSUT Esports Sign-In OTP',
      message: `Your sign-in OTP is: ${otp}. It expires in 10 minutes.`,
      html: otpEmailHtml(player.firstName, otp, 'Sign-In Verification'),
    });

    res.status(200).json({ message: 'OTP sent to your email', email: player.email });
  } catch (error) {
    console.error('requestLoginOtp error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Step 2 – Verify login OTP & issue JWT
// @route   POST /api/auth/player/login/verify-otp
// @access  Public
const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const player = await Player.findOne({ email });

    if (!player || !player.loginOtp || !player.loginOtpExpires) {
      return res.status(400).json({ message: 'OTP not generated. Please try again.' });
    }
    if (player.loginOtpExpires < Date.now()) {
      player.loginOtp = undefined;
      player.loginOtpExpires = undefined;
      await player.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (player.loginOtp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Clear OTP after use
    player.loginOtp = undefined;
    player.loginOtpExpires = undefined;
    await player.save();

    res.json({
      _id: player.id,
      firstName: player.firstName,
      email: player.email,
      role: 'player',
      token: generateToken(player.id, 'player'),
    });
  } catch (error) {
    console.error('verifyLoginOtp error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── Partner Auth ───────────────────────────────────────────────────────────

// @desc    Login Partner/Developer (email + password + organisingId)
// @route   POST /api/auth/partner/login
// @access  Public
const loginPartner = async (req, res) => {
  const { email, password, organisingId } = req.body;

  if (!email || !password || !organisingId) {
    return res.status(400).json({ message: 'Email, password, and Organising ID are required.' });
  }

  const searchEmail = email.trim().toLowerCase();
  
  // 1. Check in Database (Custom Partners created by Dev)
  try {
    const dbPartner = await Partner.findOne({ email: searchEmail });
    if (dbPartner && dbPartner.password === password && dbPartner.organisingId === organisingId.trim()) {
      return res.json({
        _id: dbPartner._id,
        name: dbPartner.name,
        email: dbPartner.email,
        role: dbPartner.role,
        token: generateToken(dbPartner.email, dbPartner.role),
      });
    }
  } catch (err) {
    console.error('Error finding partner in DB:', err);
  }

  // 2. Fallback to hardcoded PARTNERS array (FreeFire, BGMI, Valorant base partners + Developer)
  const fallbackPartner = PARTNERS.find(
    (p) =>
      p.email === searchEmail &&
      p.password === password &&
      p.organisingId === organisingId.trim()
  );

  if (fallbackPartner) {
    return res.json({
      _id: fallbackPartner.email,
      name: fallbackPartner.name,
      email: fallbackPartner.email,
      role: fallbackPartner.role,
      token: generateToken(fallbackPartner.email, fallbackPartner.role),
    });
  }

  res.status(400).json({ message: 'Invalid credentials or Organising ID.' });
};

// @desc    Get all created partners
// @route   GET /api/auth/partners
// @access  Public (Should be Developer only in real app)
const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).sort('-createdAt');
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new partner
// @route   POST /api/auth/partners
// @access  Public (Should be Developer only)
const createPartner = async (req, res) => {
  const { email, password, organisingId, role, name } = req.body;

  if (!email || !password || !organisingId || !role || !name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await Partner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A partner with this email already exists.' });
    }

    const partner = await Partner.create({
      email,
      password,
      organisingId,
      role,
      name
    });

    res.status(201).json(partner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a partner
// @route   DELETE /api/auth/partners/:id
// @access  Public (Should be Developer only)
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ── Forgot / Reset Password ────────────────────────────────────────────────

// @desc    Forgot Password (Generate OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const player = await Player.findOne({ email });

  if (!player) return res.status(404).json({ message: 'No player found with this email' });

  const otp = makeOtp();
  player.otp = otp;
  player.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await player.save();

  try {
    await sendEmail({
      email: player.email,
      subject: '🎮 VSSUT Esports – Password Reset OTP',
      message: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
      html: otpEmailHtml(player.firstName, otp, 'Password Reset'),
    });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    player.otp = undefined;
    player.otpExpires = undefined;
    await player.save();
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const player = await Player.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

  if (!player) return res.status(400).json({ message: 'Invalid OTP or expired' });

  const salt = await bcrypt.genSalt(10);
  player.password = await bcrypt.hash(newPassword, salt);
  player.otp = undefined;
  player.otpExpires = undefined;
  await player.save();

  res.status(200).json({ message: 'Password updated successfully' });
};

// ── Misc ───────────────────────────────────────────────────────────────────

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => res.status(200).json(req.user);

// @desc    Get all players (Developer only)
// @route   GET /api/auth/players
// @access  Private
const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({}).select('-password -otp -otpExpires -loginOtp -loginOtpExpires');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a player (Developer only)
// @route   DELETE /api/auth/players/:id
// @access  Private
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Player removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login / Signup with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({ message: 'Google credential required' });
  }

  try {
    // Decode the Google JWT
    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const email = decoded.email.toLowerCase();

    // Check if player already exists
    let player = await Player.findOne({ email });

    // If perfectly new player, auto-register them using their Google details
    if (!player) {
      player = await Player.create({
        firstName: decoded.given_name || 'Player',
        lastName: decoded.family_name || 'User',
        email,
        collegeName: 'Google Registered User', // They can update it later
      });
    }

    // Log them in natively
    res.status(200).json({
      _id: player._id,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      role: 'player', // or fetch from DB if role is stored
      token: generateToken(player._id, 'player'),
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
};

// ── Legacy (kept for backward compat) ─────────────────────────────────────
const registerPlayer = async (req, res) => res.status(410).json({ message: 'Use /player/signup/send-otp instead' });

// @desc    Login Player (email + password)
// @route   POST /api/auth/player/login
// @access  Public
const loginPlayer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const player = await Player.findOne({ email });
    if (!player || !player.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, player.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({
      _id: player.id,
      firstName: player.firstName,
      email: player.email,
      role: 'player',
      token: generateToken(player.id, 'player'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser, loginUser,
  registerPlayer, loginPlayer,
  requestSignupOtp, verifySignupOtp,
  requestLoginOtp, verifyLoginOtp,
  loginPartner,
  getPartners,
  createPartner,
  deletePartner,
  forgotPassword, resetPassword,
  getMe, getAllPlayers, deletePlayer,
  googleLogin,
};
