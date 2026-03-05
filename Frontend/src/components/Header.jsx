import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaCog } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDeveloper, devMode, toggleDevMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside of any nav-item-dropdown
      if (!event.target.closest('.header-account-desktop') && !event.target.closest('.header-account-mobile')) {
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

  const renderDropdownContent = () => {
    if (!user) return null;
    return (
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
    );
  };


  return (
    <header className="header glass-panel">
      <div className="container header-content">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu} style={{ textDecoration: 'none', color: '#fff' }}>
          <span className="logo-icon" style={{ fontSize: '1.6rem', lineHeight: '1' }}>🎮</span>
          <span style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
            <span className="title-gradient">VSSUT</span> ESPORTS
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="nav">
          <ul className="nav-list">
            <li><Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link></li>
            <li><Link to="/freefire" className={`nav-link ${isActive('/freefire')}`} onClick={closeMenu}>FreeFire</Link></li>
            <li><Link to="/valorant" className={`nav-link ${isActive('/valorant')}`} onClick={closeMenu}>Valorant</Link></li>
            <li><Link to="/bgmi" className={`nav-link ${isActive('/bgmi')}`} onClick={closeMenu}>BGMI</Link></li>
            {/* Account on desktop */}
            <li className="header-account-desktop" ref={dropdownRef}>
              {user ? (
                <div className="nav-item-dropdown">
                  <button className="user-avatar-btn" onClick={toggleDropdown} title={user.email} aria-label="Account menu">
                    <span className="user-avatar">{avatarLetter}</span>
                  </button>
                  {dropdownOpen && renderDropdownContent()}
                </div>
              ) : (
                <Link to="/login" className={`nav-link login-link ${isActive('/login')}`} onClick={closeMenu}>
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>

        {/* Account always visible in header on mobile */}
        <div className="header-account-mobile" ref={dropdownRef}>
          {user ? (
            <div className="nav-item-dropdown">
              <button className="user-avatar-btn" onClick={toggleDropdown} title={user.email} aria-label="Account menu">
                <span className="user-avatar">{avatarLetter}</span>
              </button>
              {dropdownOpen && renderDropdownContent()}
            </div>
          ) : (
            <Link to="/login" className={`nav-link login-link ${isActive('/login')}`} onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
