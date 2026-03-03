import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFire, FaCrosshairs, FaShieldAlt } from 'react-icons/fa';
import './MobileBottomNav.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: FaHome },
  { to: '/freefire', label: 'FreeFire', Icon: FaFire },
  { to: '/valorant', label: 'Valorant', Icon: FaCrosshairs },
  { to: '/bgmi', label: 'BGMI', Icon: FaShieldAlt },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ to, label, Icon }) => {
        const active = location.pathname === to ||
          (to !== '/' && location.pathname.startsWith(to));
        return (
          <Link key={to} to={to} className={`mbn-item ${active ? 'mbn-active' : ''}`}>
            <Icon className="mbn-icon" />
            <span className="mbn-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
