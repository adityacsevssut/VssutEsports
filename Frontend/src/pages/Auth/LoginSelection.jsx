import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaGamepad, FaCode } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './LoginSelection.css';

const LoginSelection = () => {
  const location = useLocation();
  const { isDeveloper } = useAuth();

  return (
    <div className="login-selection-page">
      <div className="container">
        <h1 className="page-title text-center">Choose Your Portal</h1>
        <p className="page-subtitle text-center">Select your role to continue</p>

        <div className="login-grid">
          {/* Player Login */}
          <Link to="/auth/player/login" state={{ from: location.state?.from }} className="login-card player-card">
            <div className="icon-wrapper">
              <FaUser />
            </div>
            <h2>Player</h2>
            <p>Login as a tournament participant</p>
          </Link>

          {/* FreeFire Partner */}
          <Link to="/auth/partner/login?type=freefire" state={{ from: location.state?.from }} className="login-card partner-card">
            <div className="icon-wrapper">
              <FaGamepad />
            </div>
            <h2>FreeFire Partner</h2>
            <p>Manage FreeFire tournaments</p>
          </Link>

          {/* BGMI Partner */}
          <Link to="/auth/partner/login?type=bgmi" state={{ from: location.state?.from }} className="login-card partner-card">
            <div className="icon-wrapper">
              <FaGamepad />
            </div>
            <h2>BGMI Partner</h2>
            <p>Manage BGMI tournaments</p>
          </Link>

          {/* Valorant Partner */}
          <Link to="/auth/partner/login?type=valorant" state={{ from: location.state?.from }} className="login-card partner-card">
            <div className="icon-wrapper">
              <FaGamepad />
            </div>
            <h2>Valorant Partner</h2>
            <p>Manage Valorant tournaments</p>
          </Link>

          {/* Developer — only visible to devlopervssutesports@gmail.com */}
          {isDeveloper && (
            <Link
              to="/auth/partner/login?type=developer"
              state={{ from: location.state?.from }}
              className="login-card dev-card"
            >
              <div className="icon-wrapper">
                <FaCode />
              </div>
              <h2>Developer</h2>
              <p>System maintenance &amp; logs</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
