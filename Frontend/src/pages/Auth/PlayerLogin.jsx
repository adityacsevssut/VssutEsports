import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AuthForm.css';
import './PlayerLogin.css';
import BASE_URL from '../../config/api';

const API = `${BASE_URL}/auth`;

const PlayerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address.'); return; }
    if (!password) { toast.error('Please enter your password.'); return; }
    setLoading(true);
    const toastId = toast.loading('Signing in…');
    try {
      const res = await axios.post(`${API}/player/login`, { email, password });
      toast.update(toastId, { render: `Welcome back, ${res.data.firstName || 'Player'}!`, type: 'success', isLoading: false, autoClose: 3000 });
      login(res.data);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Login failed. Please check your credentials.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand mark */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🎮</span>
          <span className="signup-brand-text">
            <span className="signup-brand-vssut">VSSUT</span> ESPORTS
          </span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your player account</p>


        <form onSubmit={handleSubmit} className="auth-form">

          {/* Email */}
          <div className="form-group">
            <label htmlFor="pl-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                id="pl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="pl-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="pl-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="forgot-row">
            <Link to="/auth/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            id="login-btn"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? <span className="btn-spinner"><span className="spinner" /> Signing in…</span>
              : 'Sign In'}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/auth/player/register" className="auth-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerLogin;
