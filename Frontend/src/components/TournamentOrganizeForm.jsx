import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa';
import './TournamentOrganizeForm.css';
import BASE_URL from '../config/api';

const API = `${BASE_URL}/contact`;

/* ── OTP 6-box helper ──────────────────────────────────────── */
const OtpBoxes = ({ otp, setOtp }) => {
  const refs = useRef([]);

  const handleChange = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = clean;
    setOtp(next);
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = Array(6).fill('');
    text.forEach((ch, idx) => { next[idx] = ch; });
    setOtp(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="organize-otp-boxes">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="organize-otp-box"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
const TournamentOrganizeForm = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = form details, 2 = OTP
  const [formData, setFormData] = useState({
    teamName: '',
    gameBranch: 'BGMI',
    email: '',
    mobileNumber: '',
    collegeName: '',
    year: '1st Year',
    regdOrAdharNumber: '',
  });
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  /* validate step 1 */
  const validateStep1 = () => {
    const { teamName, gameBranch, email, mobileNumber, collegeName, year, regdOrAdharNumber } = formData;
    if (!teamName.trim()) return 'Please enter your organizing team name.';
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber)) return 'Please enter a valid 10-digit mobile number.';
    if (!collegeName.trim()) return 'Please enter your college name.';
    if (!regdOrAdharNumber.trim()) return 'Please enter your Regd. or Aadhar Number.';
    return null;
  };

  /* send OTP */
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await axios.post(`${API}/send-otp`, { email: formData.email });
      if (data.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
        startResendTimer();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setErrorMsg(err); return; }
    sendOtp();
  };

  /* verify OTP + submit */
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setErrorMsg('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await axios.post(`${API}/submit`, { ...formData, otp: otpStr });
      if (data.success) {
        toast.success('🎉 Request submitted! We will contact you soon.');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organize-modal-overlay" onClick={onClose}>
      <div className="organize-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {/* Brand */}
        <div className="organize-brand">
          <span className="organize-brand-icon">🏆</span>
          <span className="organize-brand-text">
            <span className="organize-brand-vssut">VSSUT</span> ESPORTS
          </span>
        </div>

        <h1 className="organize-modal-title">Organize a Tournament</h1>
        <p className="organize-modal-subtitle">
          {step === 1 ? "Fill in your details and we'll get in touch" : 'Verify your email to send the request'}
        </p>

        {/* Step progress */}
        <div className="organize-steps">
          <div className={`organize-step ${step >= 1 ? 'active' : ''}`}>
            <div className="organize-step-dot">1</div>
            <span className="organize-step-label">Details</span>
          </div>
          <div className="organize-step-line" />
          <div className={`organize-step ${step >= 2 ? 'active' : ''}`}>
            <div className="organize-step-dot">2</div>
            <span className="organize-step-label">Verify</span>
          </div>
        </div>

        {/* Error */}
        {errorMsg && <div className="organize-error-msg">{errorMsg}</div>}

        {/* ── STEP 1: Form Details ── */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="organize-form">

            <div className="form-group">
              <label htmlFor="org-teamName">Organizing Team Name</label>
              <div className="organize-input-wrapper">
                <span className="input-icon">🏅</span>
                <input
                  id="org-teamName"
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Team Phoenix"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="org-gameBranch">Game Branch</label>
              <select id="org-gameBranch" name="gameBranch" value={formData.gameBranch} onChange={handleChange}>
                <option value="BGMI">🔫 BGMI</option>
                <option value="FREEFIRE">🔥 FreeFire</option>
                <option value="VALORANT">⚡ Valorant</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="org-email">Organizing Email (OTP will be sent here)</label>
              <div className="organize-input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="org-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="organiser@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="org-mobile">Mobile Number (IGL / Leader)</label>
              <div className="organize-input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  id="org-mobile"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="org-college">College Name</label>
              <div className="organize-input-wrapper">
                <span className="input-icon">🏫</span>
                <input
                  id="org-college"
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="e.g. VSSUT Burla"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="org-year">Year</label>
                <select id="org-year" name="year" value={formData.year} onChange={handleChange}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated / Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="org-regd">Regd No. / Aadhar No.</label>
                <div className="organize-input-wrapper">
                  <span className="input-icon">🎓</span>
                  <input
                    id="org-regd"
                    type="text"
                    name="regdOrAdharNumber"
                    value={formData.regdOrAdharNumber}
                    onChange={handleChange}
                    placeholder="VSSUT Regd. or Aadhar"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="organize-submit-btn" disabled={loading}>
              {loading
                ? <span className="btn-spinner"><span className="spinner" /> Sending OTP…</span>
                : 'Continue & Verify Email →'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="organize-form">
            <p className="organize-otp-hint">
              A 6-digit OTP has been sent to<br />
              <strong>{formData.email}</strong>
            </p>

            <OtpBoxes otp={otp} setOtp={setOtp} />

            <div className="resend-row">
              {resendTimer > 0
                ? <span>Resend OTP in <strong style={{ color: '#a5b4fc' }}>{resendTimer}s</strong></span>
                : <>
                  <span>Didn't receive it?</span>
                  <button type="button" className="resend-btn" onClick={sendOtp} disabled={loading}>
                    Resend OTP
                  </button>
                </>
              }
            </div>

            <button type="submit" className="organize-submit-btn" disabled={loading}>
              {loading
                ? <span className="btn-spinner"><span className="spinner" /> Verifying & Submitting…</span>
                : 'Submit Request ✓'}
            </button>

            <button type="button" className="organize-back-btn" onClick={() => { setStep(1); setOtp(Array(6).fill('')); setErrorMsg(''); }}>
              ← Go Back & Edit Details
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default TournamentOrganizeForm;
