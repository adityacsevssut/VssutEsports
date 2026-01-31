import { Link } from 'react-router-dom';
import { tournaments } from '../../data/tournamentData';

const ValorantTournaments = () => {
  const valTournaments = tournaments.filter(t => t.game === 'valorant');

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to="/valorant" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ff4655', fontWeight: '600' }}>
        <span>&larr;</span> Back to Valorant
      </Link>
      <h1 className="title-gradient" style={{ marginBottom: '3rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Valorant Tournaments</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {[...new Set(valTournaments.map(t => t.organisingTeam))].length > 0 ? (
          [...new Set(valTournaments.map(t => t.organisingTeam))].map(teamName => {
            const teamTournaments = valTournaments.filter(t => t.organisingTeam === teamName);
            return (
              <div key={teamName}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem', borderLeft: '4px solid #ff4655', paddingLeft: '1rem' }}>
                  By <span style={{ color: '#ff4655' }}>{teamName}</span>
                </h2>
                <div className="grid-auto">
                  {teamTournaments.map(t => (
                    <div key={t.id} className="glass-panel feature-card" style={{ borderTop: '4px solid #ff4655' }}>
                      <div>
                        <div className="card-meta">
                          <span style={{ color: 'var(--text-muted)' }}>{t.date}</span>
                          <span style={{ color: t.status === 'Upcoming' ? '#22d3ee' : '#ff4655', fontWeight: 'bold' }}>{t.status}</span>
                        </div>

                        <h3>{t.name}</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <div className="card-row">
                            <span className="card-label">Prize Pool</span>
                            <span className="card-value" style={{ color: '#ff4655' }}>{t.prize}</span>
                          </div>
                          <div className="card-row">
                            <span className="card-label">Format</span>
                            <span className="card-value">{t.format}</span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/tournaments/${t.id}`} className="btn btn-outline" style={{ marginTop: 'auto', borderColor: '#ff4655', color: '#ff4655' }}>
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>No tournaments available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default ValorantTournaments;
