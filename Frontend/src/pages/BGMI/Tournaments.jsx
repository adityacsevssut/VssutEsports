import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import bgmiImg from '../../assets/games/bgmi.png';
import BASE_URL from '../../config/api';

const THEME = '#f97316';
const GLOW = 'rgba(249, 115, 22, 0.45)';

const BGMITournaments = () => {
  const { data: bgmiTournaments, loading, error } = useFetch(`${BASE_URL}/tournaments?game=bgmi`);

  if (loading) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Error loading tournaments</div>;

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to="/bgmi" className="go-back-link" style={{ color: THEME }}>
        <span>&larr;</span> Back to BGMI
      </Link>
      <h1 className="title-gradient" style={{ marginBottom: '3rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>BGMI Tournaments</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {bgmiTournaments && bgmiTournaments.length > 0 ? (
          [...new Set(bgmiTournaments.map(t => t.organisingTeam))].map(teamName => {
            const teamTournaments = bgmiTournaments.filter(t => t.organisingTeam === teamName);
            return (
              <div key={teamName}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', marginBottom: '2rem', borderLeft: `4px solid ${THEME}`, paddingLeft: '1rem' }}>
                  By <span style={{ color: THEME }}>{teamName}</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {teamTournaments.map(t => (
                    <div
                      key={t._id}
                      style={{
                        position: 'relative',
                        height: '420px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        isolation: 'isolate',
                        border: `1px solid rgba(249,115,22,0.2)`,
                        transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${GLOW}`;
                        e.currentTarget.style.borderColor = THEME;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)';
                      }}
                    >
                      {t.posterUrl && !t.posterUrl.match(/\.(pdf)$/i) ? (
                        t.posterUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={t.posterUrl} autoPlay loop muted playsInline
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
                        ) : (
                          <img src={t.posterUrl} alt={t.name}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
                        )
                      ) : (
                        <img src={bgmiImg} alt="BGMI"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
                      )}

                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.95) 100%)',
                        zIndex: -1
                      }} />

                      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        <span style={{
                          background: t.status === 'Upcoming' ? 'rgba(34,211,238,0.15)' : `rgba(249,115,22,0.2)`,
                          border: `1px solid ${t.status === 'Upcoming' ? '#22d3ee' : THEME}`,
                          color: t.status === 'Upcoming' ? '#22d3ee' : THEME,
                          borderRadius: '50px', padding: '0.3rem 0.9rem',
                          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
                          textTransform: 'uppercase', backdropFilter: 'blur(6px)',
                        }}>
                          {t.status}
                        </span>
                      </div>

                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.35rem', fontWeight: 500 }}>{t.date}</p>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0', textShadow: '0 2px 6px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>{t.name}</h3>

                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                          <div>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Prize Pool</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: THEME, margin: 0 }}>₹{t.prize}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Format</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{t.format}</p>
                          </div>
                          {t.slots && (
                            <div>
                              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Slots</p>
                              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{t.slots}</p>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/tournaments/${t.slug || t._id}`}
                          className="link-arrow"
                          style={{ '--card-accent': `linear-gradient(135deg, ${THEME}, #eab308)`, '--card-glow': GLOW }}
                        >
                          Explore
                        </Link>
                      </div>
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

export default BGMITournaments;
