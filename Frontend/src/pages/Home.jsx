import { Link } from 'react-router-dom';
import { useTitle } from '../hooks/useTitle';
import './Home.css';
import freefireImg from '../assets/games/freefire.png';
import valorantImg from '../assets/games/valorant.png';
import bgmiImg from '../assets/games/bgmi.png';

const Home = () => {
  useTitle('Home');

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
        <div className="grid-auto">
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${freefireImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>FreeFire</h3>
              <p>Survival Battle Royale. Be the last one standing.</p>
              <Link to="/freefire" className="link-arrow">Explore &rarr;</Link>
            </div>
          </div>
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${valorantImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>Valorant</h3>
              <p>5v5 Character-based Tactical Shooter.</p>
              <Link to="/valorant" className="link-arrow">Explore &rarr;</Link>
            </div>
          </div>
          <div className="game-card glass-panel" style={{ '--bg-image': `url(${bgmiImg})` }}>
            <div className="game-card-overlay"></div>
            <div className="game-card-content">
              <h3>BGMI</h3>
              <p>Battlegrounds Mobile India. Squad up and win.</p>
              <Link to="/bgmi" className="link-arrow">Explore &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
