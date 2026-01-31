import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header glass-panel">
      <div className="container header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="title-gradient">VSSUT</span> ESPORTS
        </Link>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <button className="close-menu" onClick={closeMenu}>&times;</button>
          <ul className="nav-list">
            <li>
              <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/freefire" className={`nav-link ${isActive('/freefire')}`} onClick={closeMenu}>FreeFire</Link>
            </li>
            <li>
              <Link to="/valorant" className={`nav-link ${isActive('/valorant')}`} onClick={closeMenu}>Valorant</Link>
            </li>
            <li>
              <Link to="/bgmi" className={`nav-link ${isActive('/bgmi')}`} onClick={closeMenu}>BGMI</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
