import { Link } from 'react-router-dom';
import { useTitle } from '../../hooks/useTitle';

import valorantImg from '../../assets/games/valorant.png';

const Valorant = () => {
  useTitle('Valorant');

  return (
    <div className="container page-anim" style={{ paddingTop: '12rem', paddingBottom: '4rem' }}>
      <div className="game-menu-grid">
        <div className="glass-panel feature-card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          borderTop: '4px solid #ff4655',
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
            backgroundImage: `url(${valorantImg})`,
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
          <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', position: 'relative' }}>VALORANT</h1>
          <p style={{ color: '#e6edf3', fontSize: '1.1rem', position: 'relative', margin: 0 }}>
            Defy the limits. The tactical shooter stage is set.
          </p>
        </div>

        <div className="glass-panel feature-card" style={{ '--hover-color': '#ff4655', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '350px', margin: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="feature-icon">🏆</div>
            <h2>Tournaments</h2>
            <p>Join the 5v5 FPS action. View upcoming scrims, community cups, and major tournaments.</p>
          </div>
          <Link to="/valorant/tournaments" className="btn btn-primary" style={{ backgroundColor: '#ff4655', border: 'none', width: '100%', marginTop: '2rem' }}>View Tournaments</Link>
        </div>
      </div>
    </div>
  );
};

export default Valorant;
