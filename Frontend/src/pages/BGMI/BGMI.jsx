import { Link } from 'react-router-dom';
import { useTitle } from '../../hooks/useTitle';

import bgmiImg from '../../assets/games/bgmi.png';

const BGMI = () => {
  useTitle('BGMI');

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <div className="glass-panel game-hero" style={{
        padding: '5rem 3rem',
        textAlign: 'center',
        marginBottom: '3rem',
        borderTop: '4px solid #f97316',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgmiImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: -2
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,17,23,0.8), rgba(13,17,23,0.95))',
          zIndex: -1
        }} />
        <h1 className="title-gradient" style={{ fontSize: '4rem', marginBottom: '1rem', position: 'relative' }}>BGMI</h1>
        <p style={{ color: '#e6edf3', fontSize: '1.2rem', position: 'relative' }}>
          India ka Battlegrounds. Squad up and get that Chicken Dinner.
        </p>
      </div>

      <div className="grid-auto">
        <div className="glass-panel feature-card">
          <div>
            <div className="feature-icon">🎖️</div>
            <h2>Tournaments</h2>
            <p>Classic Erangel matches to TDM wars. Register your squad and compete for excellence.</p>
          </div>
          <Link to="/bgmi/tournaments" className="btn btn-primary" style={{ backgroundColor: '#f97316', border: 'none' }}>View Tournaments</Link>
        </div>

        <div className="glass-panel feature-card">
          <div>
            <div className="feature-icon">⚡</div>
            <h2>Organisers</h2>
            <p>The crew behind the zone. Ensuring fair play and smooth lobby management.</p>
          </div>
          <Link to="/bgmi/organisers" className="btn btn-outline" style={{ borderColor: '#f97316', color: '#f97316' }}>Meet Organisers</Link>
        </div>
      </div>
    </div>
  );
};

export default BGMI;
