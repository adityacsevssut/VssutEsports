import { Link } from 'react-router-dom';
import { useTitle } from '../../hooks/useTitle';

import freefireImg from '../../assets/games/freefire.jpg';

const FreeFire = () => {
  useTitle('FreeFire');

  return (
    <div className="container page-anim" style={{ paddingTop: '12rem', paddingBottom: '4rem' }}>
      <div className="game-menu-grid">
        <div className="glass-panel feature-card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          borderTop: '4px solid #f9a8d4',
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '350px',
          margin: 0
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
          <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', position: 'relative' }}>FREEFIRE</h1>
          <p style={{ color: '#e6edf3', fontSize: '1.1rem', position: 'relative', margin: 0 }}>
            Welcome to the FreeFire Zone. Dominate the battlegrounds.
          </p>
        </div>

        <div className="glass-panel feature-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '350px', margin: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="feature-icon">🔥</div>
            <h2>Tournaments</h2>
            <p>Battle in Bermuda. Check out upcoming clash squads and full map tournaments.</p>
          </div>
          <Link to="/freefire/tournaments" className="btn btn-primary" style={{ backgroundColor: '#ec4899', border: 'none', width: '100%', marginTop: '2rem' }}>View Tournaments</Link>
        </div>
      </div>
    </div>
  );
};

export default FreeFire;
