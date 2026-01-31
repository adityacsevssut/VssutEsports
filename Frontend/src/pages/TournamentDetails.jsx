import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { tournaments } from '../data/tournamentData';
import TournamentRegistrationForm from '../components/TournamentRegistrationForm';

const TournamentDetails = () => {
  const { tournamentId } = useParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const tournament = tournaments.find(t => t.id === tournamentId);

  if (!tournament) {
    return (
      <div className="container page-anim" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1>Tournament Not Found</h1>
        <Link to="/" className="btn btn-primary">Back Home</Link>
      </div>
    );
  }

  const getThemeColor = (game) => {
    switch (game) {
      case 'valorant': return '#ff4655';
      case 'bgmi': return '#f97316';
      case 'freefire': return '#ec4899';
      default: return 'var(--primary)';
    }
  };

  const themeColor = getThemeColor(tournament.game);

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to={`/${tournament.game}/tournaments`} style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: themeColor, fontWeight: '600' }}>
        <span>&larr;</span> Back to Tournaments
      </Link>

      <div className="glass-panel" style={{ padding: '3rem', borderTop: `4px solid ${themeColor}`, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{
              background: themeColor,
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {tournament.status}
            </span>
            <h1 style={{ fontSize: '3rem', margin: '1rem 0', lineHeight: 1.1 }}>{tournament.name}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px' }}>{tournament.description}</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date</span>
              <span style={{ fontWeight: 'bold' }}>{tournament.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Prize Pool</span>
              <span style={{ fontWeight: 'bold', color: themeColor, fontSize: '1.2rem' }}>{tournament.prize}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Format</span>
              <span style={{ fontWeight: 'bold' }}>{tournament.format}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Slots</span>
              <span style={{ fontWeight: 'bold' }}>{tournament.slots}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: themeColor }}>Rules & Guidelines</h2>
            {tournament.rulePdf && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={tournament.rulePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View PDF"
                  style={{
                    color: themeColor,
                    border: `1px solid ${themeColor}`,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = themeColor;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = themeColor;
                  }}
                >
                  View PDF
                </a>
                <a
                  href={tournament.rulePdf}
                  download
                  title="Download PDF"
                  style={{
                    backgroundColor: themeColor,
                    color: 'white',
                    border: `1px solid ${themeColor}`,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textDecoration: 'none'
                  }}
                >
                  Download
                </a>
              </div>
            )}
          </div>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tournament.rules.map((rule, i) => (
              <li key={i} style={{ listStyleType: 'disc', color: 'var(--text-main)' }}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5rem' }}>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.6rem 2.5rem', fontSize: '1rem', backgroundColor: themeColor, opacity: tournament.status === 'Registration Closed' ? 0.5 : 1, cursor: tournament.status === 'Registration Closed' ? 'not-allowed' : 'pointer' }}
          disabled={tournament.status === 'Registration Closed'}
          onClick={() => tournament.status !== 'Registration Closed' && setShowRegistration(true)}
        >
          {tournament.status === 'Registration Closed' ? 'Registration Closed' : 'Register Now'}
        </button>
      </div>

      {showRegistration && (
        <TournamentRegistrationForm
          tournament={tournament}
          themeColor={themeColor}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  );
};

export default TournamentDetails;
