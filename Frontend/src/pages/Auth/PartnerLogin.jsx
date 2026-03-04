import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthForm.css';
import './PartnerLogin.css';
import BASE_URL from '../../config/api';

const API = `${BASE_URL}/auth`;

const GAME_LABELS = {
  freefire: { label: 'Free Fire', emoji: '🔥' },
  bgmi: { label: 'BGMI', emoji: '🔫' },
  valorant: { label: 'Valorant', emoji: '🎯' },
};

const PartnerLogin = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'freefire';
  const meta = GAME_LABELS[type] || GAME_LABELS.freefire;

  const [form, setForm] = useState({ email: '', password: '', organisingId: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Authenticating partner credentials…');
    try {
      const res = await axios.post(`${API}/partner/login`, form);
      toast.update(toastId, { render: `Welcome, ${res.data.name || 'Partner'}! Access granted.`, type: 'success', isLoading: false, autoClose: 3000 });
      login(res.data);
      const from = location.state?.from?.pathname;
      navigate(from || '/admin', { replace: true, state: { game: type } });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || 'Login failed. Check your credentials.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page partner-page">
      <div className="auth-card partner-card">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🎮</span>
          <span className="signup-brand-text">
            <span className="signup-brand-vssut">VSSUT</span> ESPORTS
          </span>
        </div>

        {/* Game badge */}
        <div className="partner-badge">
          <span className="partner-badge-emoji">{meta.emoji}</span>
          <span className="partner-badge-label">{meta.label} Partner Portal</span>
        </div>

        <h1 className="auth-title" style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>
          Partner Sign In
        </h1>
        <p className="auth-subtitle">Authorised organisers only</p>


        <form onSubmit={onSubmit} className="auth-form">

          {/* Email */}
          <div className="form-group">
            <label htmlFor="p-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                id="p-email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="partner@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="p-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="p-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPass((p) => !p)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide' : 'Show'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Organising ID */}
          <div className="form-group">
            <label htmlFor="p-org-id">
              Organising ID
              <span className="id-hint">Provided by VSSUT Esports admin</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🪪</span>
              <input
                id="p-org-id"
                type="text"
                name="organisingId"
                value={form.organisingId}
                onChange={onChange}
                required
                placeholder="e.g. FF-2024-ORG"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            type="submit"
            id="partner-login-btn"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? <span className="btn-spinner"><span className="spinner" /> Signing in…</span>
              : <>Sign In <span className="arr" /></>}
          </button>
        </form>

        {/* Portal switch */}
        <div className="partner-divider"><span>Switch portal</span></div>
        <div className="partner-switch">
          {Object.entries(GAME_LABELS).map(([key, m]) =>
            key !== type && (
              <a key={key} href={`?type=${key}`} className="switch-chip">
                {m.emoji} {m.label}
              </a>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default PartnerLogin;
