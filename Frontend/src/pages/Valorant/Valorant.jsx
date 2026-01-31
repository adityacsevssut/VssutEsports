import { Link } from 'react-router-dom';
import { useTitle } from '../../hooks/useTitle';

import valorantImg from '../../assets/games/valorant.png';

const Valorant = () => {
  useTitle('Valorant');

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <div className="glass-panel game-hero" style={{
        padding: '5rem 3rem',
        textAlign: 'center',
        marginBottom: '3rem',
        borderTop: '4px solid #ff4655',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate'
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
        <h1 className="title-gradient" style={{ fontSize: '4rem', marginBottom: '1rem', position: 'relative' }}>VALORANT</h1>
        <p style={{ color: '#e6edf3', fontSize: '1.2rem', position: 'relative' }}>
          Defy the limits. The tactical shooter stage is set.
        </p>
      </div>

      <div className="grid-auto">
        <div className="glass-panel feature-card" style={{ '--hover-color': '#ff4655' }}>
          <div>
            <div className="feature-icon">🏆</div>
            <h2>Tournaments</h2>
            <p>Join the 5v5 FPS action. View upcoming scrims, community cups, and major tournaments.</p>
          </div>
          <Link to="/valorant/tournaments" className="btn btn-primary" style={{ backgroundColor: '#ff4655', border: 'none' }}>View Tournaments</Link>
        </div>

        <div className="glass-panel feature-card">
          <div>
            <div className="feature-icon">👮‍♂️</div>
            <h2>Organisers</h2>
            <p>The admins keeping the game fair and clean. Meet the team behind the matchmaking.</p>
          </div>
          <Link to="/valorant/organisers" className="btn btn-outline" style={{ borderColor: '#ff4655', color: '#ff4655' }}>Meet Organisers</Link>
        </div>
      </div>
    </div>
  );
};

export default Valorant;
