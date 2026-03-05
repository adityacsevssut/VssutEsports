import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin/AdminDashboard.css'; // Reusing admin styles for consistency or create new
import BASE_URL from '../config/api';

import freefireImg from '../assets/games/freefire.png';
import bgmiImg from '../assets/games/bgmi.png';
import valorantImg from '../assets/games/valorant.png';

const getThemeProps = (game) => {
  switch (game?.toLowerCase()) {
    case 'valorant': return { theme: '#ff4655', glow: 'rgba(255, 70, 85, 0.45)', fallbackImg: valorantImg };
    case 'bgmi': return { theme: '#f97316', glow: 'rgba(249, 115, 22, 0.45)', fallbackImg: bgmiImg };
    case 'freefire': return { theme: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)', fallbackImg: freefireImg };
    default: return { theme: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.45)', fallbackImg: freefireImg };
  }
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`${BASE_URL}/registrations/my`, config);
        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyRegistrations();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="admin-dashboard page-anim" style={{ paddingTop: '100px' }}>
      <div className="container">
        <header className="dashboard-header" style={{ marginBottom: '3rem' }}>
          <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>My Registrations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name || user?.firstName || 'Player'}</p>
        </header>

        {registrations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3>You haven't enrolled in any tournaments yet. Browse Different Tournaments.</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Join a tournament to see your status here.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/freefire/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ec4899' }}>Browse FreeFire</Link>
              <Link to="/bgmi/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#f97316' }}>Browse BGMI</Link>
              <Link to="/valorant/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ff4655' }}>Browse Valorant</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {registrations.map((reg) => {
              const t = reg.tournamentId;
              if (!t) return null; // Fallback for deleted tournaments

              const { theme, glow, fallbackImg } = getThemeProps(t.game);

              return (
                <div
                  key={reg._id}
                  style={{
                    position: 'relative',
                    height: '420px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    isolation: 'isolate',
                    border: `1px solid ${theme}30`, // Light border matching theme
                    transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${glow}`;
                    e.currentTarget.style.borderColor = theme;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = `${theme}30`;
                  }}
                >
                  {/* Background image */}
                  {t.posterUrl && !t.posterUrl.match(/\.(pdf)$/i) ? (
                    t.posterUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={t.posterUrl}
                        autoPlay loop muted playsInline
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
                      />
                    ) : (
                      <img
                        src={t.posterUrl}
                        alt={t.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
                      />
                    )
                  ) : (
                    <img
                      src={fallbackImg}
                      alt={t.game}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
                    />
                  )}

                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.95) 100%)',
                    zIndex: -1
                  }} />

                  {/* Status badge top right */}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{
                      background: t.status === 'Upcoming' ? 'rgba(34,211,238,0.15)' : `${theme}30`,
                      border: `1px solid ${t.status === 'Upcoming' ? '#22d3ee' : theme}`,
                      color: t.status === 'Upcoming' ? '#22d3ee' : theme,
                      borderRadius: '50px',
                      padding: '0.3rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(6px)',
                    }}>
                      {t.status}
                    </span>

                    <span style={{
                      background: reg.status === 'Approved' ? 'rgba(74, 222, 128, 0.2)' :
                        reg.status === 'Rejected' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                      border: '1px solid currentColor',
                      color: reg.status === 'Approved' ? '#4ade80' :
                        reg.status === 'Rejected' ? '#f87171' : '#facc15',
                      borderRadius: '50px',
                      padding: '0.2rem 0.75rem',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(6px)',
                    }}>
                      {reg.status === 'Pending' ? 'Registration Done' : `Reg: ${reg.status}`}
                    </span>
                  </div>

                  {/* Content pinned at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.35rem', fontWeight: 500 }}>{t.date || 'TBA'}</p>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0', textShadow: '0 2px 6px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>{t.name}</h3>

                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Prize Pool</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: theme, margin: 0 }}>{t.prize ? `₹${t.prize}` : 'TBA'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Format</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{t.format || 'TBA'}</p>
                      </div>
                      {t.slots && (
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Slots</p>
                          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{t.slots}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link
                        to={`/tournaments/${t.slug || t._id}`}
                        className="btn btn-primary"
                        style={{ flex: 1, textAlign: 'center', background: 'transparent', color: theme, border: `1px solid ${theme}`, fontWeight: 700 }}
                      >
                        Registration Done
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
