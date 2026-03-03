import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './AuthForm.css';
import './PlayerLogin.css';
import './PlayerSignup.css';
import BASE_URL from '../../config/api';

const API = `${BASE_URL}/auth`;

const GAMES = [
  { id: 'bgmi', label: 'BGMI', icon: '🔫' },
  { id: 'freefire', label: 'Free Fire', icon: '🔥' },
  { id: 'valorant', label: 'Valorant', icon: '🎯' },
];

/* ── OTP digit-box (reused from Login) ───────────────────── */
const OtpInput = ({ otp, setOtp }) => {
  const refs = useRef([]);

  const handleKey = (e, idx) => {
    const { key } = e;
    if (key === 'Backspace') {
      if (otp[idx]) {
        const next = [...otp]; next[idx] = ''; setOtp(next);
      } else if (idx > 0) refs.current[idx - 1].focus();
      return;
    }
    if (!/^\d$/.test(key)) return;
    const next = [...otp]; next[idx] = key; setOtp(next);
    if (idx < 5) refs.current[idx + 1].focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...otp];
    text.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtp(next);
    refs.current[Math.min(text.length, 5)].focus();
    e.preventDefault();
  };

  return (
    <div className="otp-boxes">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={() => { }}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="otp-box"
          id={`su-otp-digit-${i}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

/* ── Main component ───────────────────────────────────────── */
const PlayerSignup = () => {
  const [step, setStep] = useState(1);

  // Step 1 form data
  const [form, setForm] = useState({
    firstName: '', lastName: '', collegeName: '',
    email: '', password: '', confirmPassword: '',
  });
  const [selectedGames, setSelectedGames] = useState([]);

  // Step 2 OTP
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendCd, setRcd] = useState(0);

  // Shared
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Countdown
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setRcd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleGame = (id) => {
    if (id === 'all') {
      setSelectedGames((prev) =>
        prev.includes('all') ? [] : ['all']
      );
    } else {
      setSelectedGames((prev) =>
        prev.includes('all')
          ? [id]
          : prev.includes(id)
            ? prev.filter((g) => g !== id)
            : [...prev, id]
      );
    }
  };

  /* Step 1 – submit form & send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.'); return;
    }
    if (selectedGames.length === 0) {
      toast.error('Please select at least one game to continue.'); return;
    }
    setLoading(true);
    const toastId = toast.loading(`Sending OTP to ${form.email}…`);
    try {
      await axios.post(`${API}/player/signup/send-otp`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        collegeName: form.collegeName,
        games: selectedGames,
        password: form.password,
      });
      toast.update(toastId, { render: `OTP sent to ${form.email}. Check your inbox.`, type: 'success', isLoading: false, autoClose: 4000 });
      setStep(2);
      setRcd(60);
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Failed to send OTP. Try again.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 – verify OTP */
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    const toastId = toast.loading('Verifying OTP…');
    try {
      const res = await axios.post(`${API}/player/signup/verify-otp`, {
        email: form.email, otp: code,
      });
      toast.update(toastId, { render: `Account created! Welcome to VSSUT Esports, ${res.data.firstName}!`, type: 'success', isLoading: false, autoClose: 3500 });
      login(res.data);
      navigate('/');
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Verification failed. Check your OTP.', type: 'error', isLoading: false, autoClose: 4000 });
      setLoading(false);
    }
  };

  /* ── Google Signup Handler ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading('Signing up with Google…');
    try {
      setLoading(true);
      const res = await axios.post(`${API}/google`, {
        credential: credentialResponse.credential,
      });
      toast.update(toastId, { render: `Welcome, ${res.data.firstName}! Account created with Google.`, type: 'success', isLoading: false, autoClose: 3500 });
      login(res.data);
      navigate('/');
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Google signup failed. Try again.', type: 'error', isLoading: false, autoClose: 4000 });
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup was cancelled or interrupted.');
  };

  /* Resend OTP */
  const handleResend = async () => {
    if (resendCd > 0) return;
    setLoading(true);
    setOtp(Array(6).fill(''));
    const toastId = toast.loading('Resending OTP…');
    try {
      await axios.post(`${API}/player/signup/send-otp`, {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, collegeName: form.collegeName,
        games: selectedGames, password: form.password,
      });
      toast.update(toastId, { render: `New OTP sent to ${form.email}.`, type: 'success', isLoading: false, autoClose: 4000 });
      setRcd(60);
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Failed to resend OTP.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">

        {/* Brand */}
        <div className="auth-brand signup-brand">
          <span className="auth-brand-icon">🎮</span>
          <span className="signup-brand-text">
            <span className="signup-brand-vssut">VSSUT</span> ESPORTS
          </span>
        </div>

        {/* Step progress */}
        <div className="login-steps">
          <div className={`login-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-dot">1</span>
            <span className="step-label">Your Details</span>
          </div>
          <div className="step-line" />
          <div className={`login-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-dot">2</span>
            <span className="step-label">Verify Email</span>
          </div>
        </div>

        <h1 className="auth-title">
          {step === 1 ? 'Create Account' : 'Verify Your Email'}
        </h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Join VSSUT Esports and compete' : `Check your inbox at ${form.email}`}
        </p>

        {error && <div className="error-msg">{error}</div>}
        {info && <div className="success-msg">{info}</div>}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">

            {/* Name row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="su-fn">First Name</label>
                <input id="su-fn" name="firstName" type="text"
                  value={form.firstName} onChange={onChange}
                  required placeholder="First name" />
              </div>
              <div className="form-group">
                <label htmlFor="su-ln">Last Name</label>
                <input id="su-ln" name="lastName" type="text"
                  value={form.lastName} onChange={onChange}
                  required placeholder="Last name" />
              </div>
            </div>

            {/* College */}
            <div className="form-group">
              <label htmlFor="su-college">College Name</label>
              <input id="su-college" name="collegeName" type="text"
                value={form.collegeName} onChange={onChange}
                required placeholder="e.g. VSSUT, Burla" />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="su-email">Email Address</label>
              <input id="su-email" name="email" type="email"
                value={form.email} onChange={onChange}
                required placeholder="your@email.com" />
            </div>

            {/* Games */}
            <div className="form-group">
              <label>Sports / Games</label>
              <div className="games-grid">
                {GAMES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`game-chip ${selectedGames.includes(g.id) ? 'selected' : ''}`}
                    onClick={() => toggleGame(g.id)}
                    id={`game-${g.id}`}
                  >
                    <span className="game-icon">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`game-chip game-all ${selectedGames.includes('all') ? 'selected' : ''}`}
                  onClick={() => toggleGame('all')}
                  id="game-all"
                >
                  <span className="game-icon">🏆</span>
                  All Games
                </button>
              </div>
            </div>

            {/* Password row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="su-pass">Password</label>
                <input id="su-pass" name="password" type="password"
                  value={form.password} onChange={onChange}
                  required placeholder="Set password" />
              </div>
              <div className="form-group">
                <label htmlFor="su-cpass">Confirm Password</label>
                <input id="su-cpass" name="confirmPassword" type="password"
                  value={form.confirmPassword} onChange={onChange}
                  required placeholder="Repeat password" />
              </div>
            </div>

            <button type="submit" id="su-send-otp-btn" className="auth-btn" disabled={loading}>
              {loading
                ? <span className="btn-spinner"><span className="spinner" /> Sending OTP…</span>
                : <>'Send OTP & Continue' <span className="arr" /></>}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="google-auth-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                shape="pill"
                text="signup_with"
              />
            </div>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="auth-form">
            <p className="otp-hint">
              Enter the 6-digit code we sent to <strong>{form.email}</strong>
            </p>

            <OtpInput otp={otp} setOtp={setOtp} />

            <button type="submit" id="su-verify-btn" className="auth-btn" disabled={loading}>
              {loading
                ? <span className="btn-spinner"><span className="spinner" /> Verifying…</span>
                : 'Verify & Create Account'}
            </button>

            <div className="resend-row">
              <span>Didn't receive the code?</span>
              <button type="button" className="resend-btn"
                onClick={handleResend} disabled={resendCd > 0 || loading}>
                {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
              </button>
            </div>

            <button type="button" className="back-btn"
              onClick={() => { setStep(1); setError(''); setInfo(''); setOtp(Array(6).fill('')); }}>
              ← Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account?
          <Link to="/auth/player/login" className="auth-link">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerSignup;
