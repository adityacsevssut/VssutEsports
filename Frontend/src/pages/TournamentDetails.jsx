import { Link, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import TournamentRegistrationForm from '../components/TournamentRegistrationForm';
import { useAuth } from '../context/AuthContext';
import './TournamentDetails.css'; // Import specific CSS for responsive design
import BASE_URL from '../config/api';

const TournamentDetails = () => {
  const { tournamentId } = useParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const { data: tournament, loading, error } = useFetch(`${BASE_URL}/tournaments/${tournamentId}`);

  // Fetching the organizer details if requested
  const { data: organizerData, loading: orgLoading } = useFetch(
    showOrganizerModal && tournament?.organisingTeam
      ? `${BASE_URL}/organizers/${tournament.organisingTeam}`
      : null
  );
  const { user } = useAuth();
  const location = useLocation();

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!tournament?.registrationClosesAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(tournament.registrationClosesAt) - new Date();
      if (difference <= 0) {
        setTimeLeft('Closed');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [tournament?.registrationClosesAt]);

  if (loading) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>;
  if (error || !tournament) {
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

  let displayStatus = tournament.status;
  const isTimeExpired = tournament.registrationClosesAt && new Date() > new Date(tournament.registrationClosesAt);
  if (displayStatus === 'Registration Open' && isTimeExpired) {
    displayStatus = 'Registration Closed';
  }

  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if the user is already registered for this tournament
    const checkRegistrationStatus = async () => {
      if (user && tournament) {
        try {
          const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await fetch(`${BASE_URL}/registrations/my`, config).then(res => res.json());

          if (Array.isArray(data)) {
            const alreadyRegistered = data.some(reg => reg.tournamentId?._id === tournament._id || reg.tournamentId === tournament._id);
            setIsRegistered(alreadyRegistered);
          }
        } catch (err) {
          console.error("Error checking registration status", err);
        }
      }
    };
    checkRegistrationStatus();
  }, [user, tournament]);

  // Users can now view details and rules irrespective of login status
  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to={`/${tournament.game}/tournaments`} className="go-back-link" style={{ color: themeColor }}>
        <span>&larr;</span> Back to Tournaments
      </Link>

      <div className="glass-panel tournament-title-section" style={{ padding: '3rem', borderTop: `4px solid ${themeColor}`, marginBottom: '2rem' }}>
        <div className="tournament-header">
          <div className="tournament-info-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
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
                {displayStatus}
              </span>
              <button
                onClick={() => setShowOrganizerModal(true)}
                style={{
                  background: 'transparent',
                  color: themeColor,
                  border: `1px solid ${themeColor}`,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
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
                View Organizers
              </button>
              {tournament.registrationClosesAt && displayStatus === 'Registration Open' && timeLeft && timeLeft !== 'Closed' && (
                <span style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  borderLeft: '2px solid rgba(255,255,255,0.1)',
                  paddingLeft: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  Registration closing in: <strong style={{ color: themeColor, marginLeft: '0.5rem' }}>
                    {timeLeft}
                  </strong>
                </span>
              )}
            </div>
            <h1>{tournament.name}</h1>
            <p>{tournament.description}</p>

            {/* ── Action Buttons: always visible, active when file uploaded ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '1.5rem' }}>

              {/* Download Fixtures */}
              {tournament.fixturesUrl ? (
                <a
                  href={tournament.fixturesUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.7rem 1.4rem', borderRadius: '10px',
                    background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}66)`,
                    border: `1.5px solid ${themeColor}`,
                    boxShadow: `0 0 16px ${themeColor}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                    textDecoration: 'none', letterSpacing: '0.4px',
                    transition: 'all 0.3s ease', backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 0 28px ${themeColor}77, inset 0 1px 0 rgba(255,255,255,0.18)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 0 16px ${themeColor}44, inset 0 1px 0 rgba(255,255,255,0.12)`;
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🗓️</span> Download Fixtures
                </a>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1.4rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.85rem',
                  letterSpacing: '0.4px', cursor: 'default',
                }}>
                  <span style={{ fontSize: '1rem' }}>🗓️</span> Fixtures &nbsp;<span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>SOON</span>
                </span>
              )}

              {/* See Point Table */}
              {tournament.pointTableUrl ? (
                <a
                  href={tournament.pointTableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.7rem 1.4rem', borderRadius: '10px',
                    background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}66)`,
                    border: `1.5px solid ${themeColor}`,
                    boxShadow: `0 0 16px ${themeColor}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                    textDecoration: 'none', letterSpacing: '0.4px',
                    transition: 'all 0.3s ease', backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 0 28px ${themeColor}77, inset 0 1px 0 rgba(255,255,255,0.18)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 0 16px ${themeColor}44, inset 0 1px 0 rgba(255,255,255,0.12)`;
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🏆</span> See Point Table
                </a>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1.4rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.85rem',
                  letterSpacing: '0.4px', cursor: 'default',
                }}>
                  <span style={{ fontSize: '1rem' }}>🏆</span> Point Table &nbsp;<span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>SOON</span>
                </span>
              )}

            </div>
          </div>

          <div className="tournament-info-right">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Slots</span>
              <span style={{ fontWeight: 'bold' }}>{tournament.slots}</span>
            </div>
            {tournament.playerFormat && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Player Format</span>
                <span style={{ fontWeight: 'bold' }}>{tournament.playerFormat}</span>
              </div>
            )}
            {tournament.pricePerTeam && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price Per Team</span>
                <span style={{ fontWeight: 'bold', color: tournament.pricePerTeam.toLowerCase() === 'free' ? '#4ade80' : themeColor }}>{tournament.pricePerTeam}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="guidelines-header">
            <h2 style={{ margin: 0, color: themeColor }}>Rules & Guidelines</h2>
            {tournament.guidelinesUrl ? (
              <a
                href={tournament.guidelinesUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.55rem 1.25rem', borderRadius: '10px',
                  background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}55)`,
                  border: `1.5px solid ${themeColor}`,
                  boxShadow: `0 0 14px ${themeColor}44`,
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                  textDecoration: 'none', letterSpacing: '0.4px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 0 24px ${themeColor}66`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 0 14px ${themeColor}44`;
                }}
              >
                {tournament.guidelinesUrl.match(/\.pdf$/i) ? '📄' : '🖼️'} Download Guidelines
              </a>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.45rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1.5px dashed rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600,
              }}>
                📋 Guidelines &nbsp;<span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>SOON</span>
              </span>
            )}
          </div>

          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tournament.rules && tournament.rules.map((rule, i) => (
              <li key={i} style={{ listStyleType: 'disc', color: 'var(--text-main)' }}>{rule}</li>
            ))}
          </ul>
          {(!tournament.rules || tournament.rules.length === 0) && !tournament.guidelinesUrl && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No rules or guidelines have been added yet.</p>
          )}
        </div>
      </div >

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
        {displayStatus === 'Registration Open' ? (
          <>
            {user ? (
              <button
                className="btn btn-primary"
                disabled={isRegistered}
                style={{
                  width: 'auto',
                  padding: '0.6rem 2.5rem',
                  fontSize: '1rem',
                  backgroundColor: isRegistered ? 'transparent' : themeColor,
                  color: isRegistered ? themeColor : 'white',
                  border: isRegistered ? `2px solid ${themeColor}` : 'none',
                  opacity: isRegistered ? 1 : 1,
                  cursor: isRegistered ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => !isRegistered && setShowRegistration(true)}
              >
                {isRegistered ? '✅ Registration Done' : 'Register Now'}
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Login to register</p>
                <Link to="/login" state={{ from: location }} className="btn btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '0.6rem 2.5rem', background: themeColor }}>
                  Login to Register
                </Link>
              </div>
            )}
            {tournament.registrationClosesAt && (
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Registration closes on: <span style={{ color: themeColor, fontWeight: 'bold' }}>{new Date(tournament.registrationClosesAt).toLocaleString()}</span>
              </p>
            )}
          </>
        ) : (
          <button
            className="btn btn-primary"
            style={{
              width: 'auto',
              padding: '0.6rem 2.5rem',
              fontSize: '1rem',
              backgroundColor: themeColor,
              opacity: 0.5,
              cursor: 'not-allowed'
            }}
            disabled={true}
          >
            {displayStatus === 'Upcoming' ? 'Registration Not Opened Yet' : 'Registration Closed'}
          </button>
        )}
      </div>

      {
        showRegistration && (
          <TournamentRegistrationForm
            tournament={tournament}
            themeColor={themeColor}
            onClose={(success) => {
              if (success) setIsRegistered(true);
              setShowRegistration(false)
            }}
          />
        )
      }

      {
        showOrganizerModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0a0a0a',
              padding: '2.5rem 3rem',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: `2px solid ${organizerData?.color || themeColor}`,
              boxShadow: `0 0 20px -5px ${organizerData?.color || themeColor}40`,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: organizerData?.color || themeColor, fontSize: '1.8rem', fontWeight: 'bold' }}>Organizer Team</h2>
                <button
                  onClick={() => setShowOrganizerModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                  &times;
                </button>
              </div>

              {orgLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading organizer details...</p>
              ) : organizerData && !organizerData.message ? (
                <div>
                  <h3 style={{ fontSize: '2rem', marginBottom: '0.8rem', fontWeight: '800', color: 'white' }}>{organizerData.name}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>{organizerData.description}</p>
                  <h4 style={{ marginBottom: '1.2rem', color: organizerData.color || themeColor, fontSize: '1.2rem', fontWeight: '700' }}>Team Members</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {organizerData.members && organizerData.members.map((member, idx) => (
                      <div key={idx} style={{
                        background: '#161921',
                        padding: '2.5rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '60px',
                          background: `linear-gradient(to bottom, ${organizerData.color || themeColor}2a, transparent)`,
                          zIndex: 0
                        }} />

                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          border: `2px solid ${organizerData.color || themeColor}`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'white',
                          background: '#1a1d24',
                          marginBottom: '1rem',
                          zIndex: 1
                        }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                        <h4 style={{
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.5rem',
                          zIndex: 1,
                          textAlign: 'center'
                        }}>
                          {member.name}
                        </h4>

                        <span style={{
                          color: organizerData.color || themeColor,
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          marginBottom: '2rem',
                          zIndex: 1
                        }}>
                          {member.role || 'Organizer'}
                        </span>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 1 }}>
                          <div style={{ background: '#1c1f26', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mobile</span>
                            <strong style={{ color: 'white' }}>{member.mobile || 'N/A'}</strong>
                          </div>
                          <div style={{ background: '#1c1f26', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Year</span>
                            <strong style={{ color: 'white' }}>{member.year || 'N/A'}</strong>
                          </div>
                          <div style={{ background: '#1c1f26', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Branch</span>
                            <strong style={{ color: 'white' }}>{member.branch || 'N/A'}</strong>
                          </div>
                          <div style={{ background: '#1c1f26', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>College</span>
                            <strong style={{ color: 'white' }}>{member.college || 'N/A'}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!organizerData.members || organizerData.members.length === 0) && (
                      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No members listed.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Detailed info is not publicly available for this organiser.</p>
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#121212', borderRadius: '10px', borderLeft: `4px solid ${themeColor}` }}>
                    <strong style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Organising Name:</strong> <span style={{ color: 'white', fontWeight: 'bold' }}>{tournament.organisingTeam}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default TournamentDetails;
