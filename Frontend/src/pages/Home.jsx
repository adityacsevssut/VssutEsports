import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from '../hooks/useTitle';
import './Home.css';
import freefireImg from '../assets/games/freefire.png';
import valorantImg from '../assets/games/valorant.png';
import bgmiImg from '../assets/games/bgmi.png';
import TournamentOrganizeForm from '../components/TournamentOrganizeForm';
import { FaWhatsapp } from 'react-icons/fa';

const Home = () => {
  useTitle('Home');
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);

  return (
    <div className="home page-anim">
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            <span className="title-gradient">VSSUT BURLA</span><br />
            ESPORTS
          </h1>
          <p className="hero-subtitle">
            The official esports community of Veer Surendra Sai University of Technology.
            Join the battle, compete with the best, and rise to glory.
          </p>
          <div className="hero-cta">
            <Link to="/valorant" className="btn btn-primary">Join Valorant</Link>
            <Link to="/bgmi" className="btn btn-outline">Explore BGMI</Link>
            <Link to="/freefire" className="btn btn-secondary">Play FreeFire</Link>
          </div>
        </div>
      </section>

      <section className="games-preview container">
        <h2 className="section-title">Featured Games</h2>
        <div className="grid-featured">
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${freefireImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>FreeFire</h3>
              <p>Survival Battle Royale. Be the last one standing.</p>
              <Link to="/freefire" className="link-arrow">Explore</Link>
            </div>
          </div>
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${valorantImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>Valorant</h3>
              <p>5v5 Character-based Tactical Shooter.</p>
              <Link to="/valorant" className="link-arrow">Explore</Link>
            </div>
          </div>
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${bgmiImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>BGMI</h3>
              <p>Battlegrounds Mobile India. Squad up and win.</p>
              <Link to="/bgmi" className="link-arrow">Explore</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Organize a Tournament CTA ── */}
      <section className="organize-cta-section container">
        <div className="organize-cta-bg" />
        <div className="organize-cta-inner">
          <span className="organize-cta-badge">🏆 Host an Event</span>
          <h2 className="organize-cta-title">
            Want to <span>Organize</span> a Tournament?
          </h2>
          <p className="organize-cta-desc">
            Got a team and a vision? Reach out to us and we'll help you host an
            epic esports event at VSSUT. Fill in your details and we'll handle the rest.
          </p>
          <button className="organize-cta-btn" onClick={() => setIsOrganizeModalOpen(true)}>
            <span className="btn-icon">📋</span> Contact Us to Organize
          </button>
        </div>
      </section>

      {/* ── Join Our WhatsApp Community ── */}
      <section className="community-section container">
        <div className="community-section-bg" />
        <div className="community-inner">
          <span className="community-badge">💬 Community</span>
          <h2 className="community-title">
            Join Our <span>Community</span>
          </h2>
          <p className="community-desc">
            Be part of the growing VSSUT Esports family. Get updates on tournaments,
            match schedules, team announcements and more — all in one place.
          </p>
          <a href="#" className="community-wp-link" title="Join WhatsApp Community (link coming soon)">
            <FaWhatsapp className="community-wp-icon" />
            Join on WhatsApp
          </a>
          <p className="community-note">Link will be updated soon. Stay tuned!</p>
        </div>
      </section>

      {isOrganizeModalOpen && (
        <TournamentOrganizeForm onClose={() => setIsOrganizeModalOpen(false)} />
      )}
    </div>
  );
};

export default Home;

