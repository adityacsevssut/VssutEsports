import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const year = new Date().getFullYear();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className="footer">

      {/* Top glow line */}
      <div className="footer-glow-line" />

      <div className="container footer-body">

        {/* ── Brand Column ── */}
        <div className="footer-col footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">🎮</span>
            <span className="footer-logo-text">
              <span className="title-gradient">VSSUT</span> ESPORTS
            </span>
          </Link>
          <p className="footer-tagline">
            The official esports community of Veer Surendra Sai University of Technology, Burla.
            Compete. Collaborate. Conquer.
          </p>
          {/* Social icons */}
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Discord">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter / X">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Games Column ── */}
        <div className="footer-col">
          <h4 className="footer-heading">Games</h4>
          <ul className="footer-links">
            <li>
              <Link to="/freefire" className={`footer-link ${isActive('/freefire') ? 'footer-link--active' : ''}`}>
                🔥 Free Fire
              </Link>
            </li>
            <li>
              <Link to="/valorant" className={`footer-link ${isActive('/valorant') ? 'footer-link--active' : ''}`}>
                🎯 Valorant
              </Link>
            </li>
            <li>
              <Link to="/bgmi" className={`footer-link ${isActive('/bgmi') ? 'footer-link--active' : ''}`}>
                🔫 BGMI
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Quick Links Column ── */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className={`footer-link ${isActive('/') ? 'footer-link--active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/auth/player/signup" className={`footer-link ${isActive('/auth/player/signup') ? 'footer-link--active' : ''}`}>
                Register
              </Link>
            </li>
            <li>
              <Link to="/auth/player/login" className={`footer-link ${isActive('/auth/player/login') ? 'footer-link--active' : ''}`}>
                Player Login
              </Link>
            </li>
            <li>
              <Link to="/login" className={`footer-link ${isActive('/login') ? 'footer-link--active' : ''}`}>
                Partner Login
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className={`footer-link ${isActive('/dashboard') ? 'footer-link--active' : ''}`}>
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Contact Column ── */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-links footer-contact">
            <li>
              <span className="contact-icon">📍</span>
              <span>VSSUT Burla, Sambalpur, Odisha — 768018</span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <a href="mailto:vssutesports@gmail.com" className="footer-link">
                vssutesports@gmail.com
              </a>
            </li>
            <li>
              <span className="contact-icon">🕹️</span>
              <span>Open to all VSSUT students</span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © {year} <span className="title-gradient">VSSUT Esports</span>. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <span className="footer-bottom-link">Privacy Policy</span>
            <span className="footer-bottom-sep">•</span>
            <span className="footer-bottom-link">Terms of Use</span>
            <span className="footer-bottom-sep">•</span>
            <span className="footer-bottom-link">Code of Conduct</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
