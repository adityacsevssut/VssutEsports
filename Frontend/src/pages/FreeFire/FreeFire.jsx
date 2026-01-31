import { Link } from 'react-router-dom';
import { useTitle } from '../../hooks/useTitle';

import freefireImg from '../../assets/games/freefire.png';

const FreeFire = () => {
  useTitle('FreeFire');

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <div className="glass-panel game-hero" style={{
        padding: '5rem 3rem',
        textAlign: 'center',
        marginBottom: '3rem',
        borderTop: '4px solid #f9a8d4',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${freefireImg})`,
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
        <h1 className="title-gradient" style={{ fontSize: '4rem', marginBottom: '1rem', position: 'relative' }}>FREEFIRE</h1>
        <p style={{ color: '#e6edf3', fontSize: '1.2rem', position: 'relative' }}>
          Welcome to the FreeFire Zone. Dominate the battlegrounds.
        </p>
      </div>

      <div className="grid-auto">
        <div className="glass-panel feature-card">
          <div>
            <div className="feature-icon">🔥</div>
            <h2>Tournaments</h2>
            <p>Battle in Bermuda. Check out upcoming clash squads and full map tournaments.</p>
          </div>
          <Link to="/freefire/tournaments" className="btn btn-primary" style={{ backgroundColor: '#ec4899', border: 'none' }}>View Tournaments</Link>
        </div>

        <div className="glass-panel feature-card">
          <div>
            <div className="feature-icon">🛡️</div>
            <h2>Organisers</h2>
            <p>Meet the team behind the FreeFire events. Dedicated to bringing you the best competitive experience.</p>
          </div>
          <Link to="/freefire/organisers" className="btn btn-outline" style={{ borderColor: '#ec4899', color: '#ec4899' }}>Meet Organisers</Link>
        </div>
      </div>
    </div>
  );
};

export default FreeFire;
