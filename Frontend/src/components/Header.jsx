import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaCog } from 'react-icons/fa';
import { FaGamepad } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDeveloper, devMode, toggleDevMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const closeMenu = () => setDropdownOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate('/'); };
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  /* ── Avatar letter ── */
  const avatarLetter = user
    ? (user.firstName || user.username || user.name || 'U')[0].toUpperCase()
    : '';

  /* ── Dropdown menu (reused in both desktop & mobile) ── */
  const AccountDropdown = ({ ref: r }) => user ? (
    <div className="nav-item-dropdown" ref={r}>
      <button className="user-avatar-btn" onClick={toggleDropdown} title={user.email} aria-label="Account menu">
        <span className="user-avatar">{avatarLetter}</span>
      </button>

      {dropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="dropdown-name">{user.firstName || user.username || user.name}</p>
            <p className="dropdown-role">{user.role}</p>
            <p className="dropdown-email">{user.email}</p>
          </div>

          {isDeveloper && (
            <div className="dev-mode-row">
              <span className="dev-mode-label">
                <span className="dev-mode-icon">⚙️</span>Dev Mode
              </span>
              <button
                className={`dev-toggle ${devMode ? 'on' : 'off'}`}
                onClick={(e) => { e.stopPropagation(); toggleDevMode(); }}
                aria-label="Toggle developer mode"
              >
                <span className="dev-toggle-thumb" />
              </button>
            </div>
          )}

          <Link
            to={user.role === 'player' ? '/dashboard' : '/admin'}
            className="dropdown-item"
            onClick={closeMenu}
          >
            <FaCog />
            {user.role === 'player' ? 'My Registrations' : 'Dashboard'}
          </Link>

          {isDeveloper && devMode && (
            <Link to="/admin" className="dropdown-item dev-item" onClick={closeMenu}>
              <span>🛠</span> Developer Dashboard
            </Link>
          )}

          <button className="dropdown-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link to="/login" className={`nav-link login-link ${isActive('/login')}`} onClick={closeMenu}>
      Login
    </Link>
  );

  return (
    <header className="header glass-panel">
      <div className="container header-content">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <FaGamepad className="logo-icon" />
          <span className="title-gradient">VSSUT</span> ESPORTS
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="nav">
          <ul className="nav-list">
            <li><Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link></li>
            <li><Link to="/freefire" className={`nav-link ${isActive('/freefire')}`} onClick={closeMenu}>FreeFire</Link></li>
            <li><Link to="/valorant" className={`nav-link ${isActive('/valorant')}`} onClick={closeMenu}>Valorant</Link></li>
            <li><Link to="/bgmi" className={`nav-link ${isActive('/bgmi')}`} onClick={closeMenu}>BGMI</Link></li>
            {/* Account on desktop */}
            <li><AccountDropdown ref={dropdownRef} /></li>
          </ul>
        </nav>

        {/* Account always visible in header on mobile */}
        <div className="header-account-mobile" ref={dropdownRef}>
          <AccountDropdown />
        </div>

      </div>
    </header>
  );
};

export default Header;
