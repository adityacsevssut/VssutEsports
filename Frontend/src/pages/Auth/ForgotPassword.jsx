import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AuthForm.css';
import BASE_URL from '../../config/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(`Sending OTP to ${email}…`);
    try {
      await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
      toast.update(toastId, { render: `OTP sent to ${email}. Check your inbox.`, type: 'success', isLoading: false, autoClose: 4000 });
      setStep(2);
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Failed to send OTP.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Resetting your password…');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        email, otp, newPassword
      });
      toast.update(toastId, { render: 'Password reset successfully! Redirecting to login...', type: 'success', isLoading: false, autoClose: 3000 });
      setTimeout(() => navigate('/auth/player/login'), 2500);
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Failed to reset password.', type: 'error', isLoading: false, autoClose: 4000 });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>


        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'transparent', border: 'none', color: '#888', width: '100%', marginTop: '1rem', cursor: 'pointer' }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
