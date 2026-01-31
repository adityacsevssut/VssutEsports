import { Link } from 'react-router-dom';
import { bgmiTeams } from '../../data/bgmiData';

const BGMIOrganisers = () => {
  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to="/bgmi" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#f97316', fontWeight: '600' }}>
        <span>&larr;</span> Back to BGMI
      </Link>
      <h1 className="title-gradient" style={{ marginBottom: '3rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>BGMI Organising Teams</h1>

      <div className="grid-auto">
        {bgmiTeams.map(team => (
          <div key={team.id} className="glass-panel feature-card" style={{ padding: '1.5rem', borderTop: `4px solid ${team.color || '#f97316'}` }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>{team.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>{team.description}</p>
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '-10px' }}>
                {team.members.slice(0, 3).map((m, i) => (
                  <div key={m.id} style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: '#30363d', border: '2px solid #161b22', marginLeft: i > 0 ? '-10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                  }}>
                    {m.name.charAt(0)}
                  </div>
                ))}
                {team.members.length > 3 && <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#21262d', border: '2px solid #161b22', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>+{team.members.length - 3}</div>}
              </div>
            </div>

            <Link to={`/bgmi/organisers/${team.id}`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', borderColor: team.color, color: team.color }}>
              Know About More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BGMIOrganisers;
