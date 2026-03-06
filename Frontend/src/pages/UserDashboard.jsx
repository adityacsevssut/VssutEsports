import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin/AdminDashboard.css';
import './UserDashboard.css';
import BASE_URL from '../config/api';
import PageLoader from '../components/PageLoader';
import { motion } from 'framer-motion';
import { FaUsers, FaCrown, FaUser, FaGamepad, FaInfoCircle, FaTrophy, FaCalendarAlt } from 'react-icons/fa';

import freefireImg from '../assets/games/freefire.jpg';
import bgmiImg from '../assets/games/bgmi.jpg';
import valorantImg from '../assets/games/valorant.jpg';

const getThemeProps = (game) => {
  switch (game?.toLowerCase()) {
    case 'valorant': return { theme: '#ff4655', rgb: '255, 70, 85', glow: 'rgba(255, 70, 85, 0.45)', fallbackImg: valorantImg };
    case 'bgmi': return { theme: '#f97316', rgb: '249, 115, 22', glow: 'rgba(249, 115, 22, 0.45)', fallbackImg: bgmiImg };
    case 'freefire': return { theme: '#ec4899', rgb: '236, 72, 153', glow: 'rgba(236, 72, 153, 0.45)', fallbackImg: freefireImg };
    default: return { theme: '#8b5cf6', rgb: '139, 92, 246', glow: 'rgba(139, 92, 246, 0.45)', fallbackImg: freefireImg };
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
    return <PageLoader />;
  }

  const approvedRegistrations = registrations.filter(r => r.status === 'Approved');

  return (
    <div className="user-dashboard-main page-anim" style={{ paddingTop: '100px' }}>
      <div className="container">
        <header className="dashboard-header" style={{ marginBottom: '3rem' }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="title-gradient"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            My Registrations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-muted)' }}
          >
            Manage your tournament entries and team details
          </motion.p>
        </header>

        {registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <FaGamepad style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />
            <h3>You haven't enrolled in any tournaments yet.</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Join a tournament to see your status here.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/freefire/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ec4899' }}>Browse FreeFire</Link>
              <Link to="/bgmi/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#f97316' }}>Browse BGMI</Link>
              <Link to="/valorant/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ff4655' }}>Browse Valorant</Link>
            </div>
          </motion.div>
        ) : approvedRegistrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ color: '#facc15' }}>Registration Under Review</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              Your registration is submitted and waiting for partner approval. Your tournament card will appear here once approved.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/freefire/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ec4899' }}>Browse FreeFire</Link>
              <Link to="/bgmi/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#f97316' }}>Browse BGMI</Link>
              <Link to="/valorant/tournaments" className="btn btn-primary" style={{ width: 'auto', background: '#ff4655' }}>Browse Valorant</Link>
            </div>
          </motion.div>
        ) : (
          <div className="user-dashboard-container">
            {approvedRegistrations.map((reg, index) => {
              const t = reg.tournamentId;
              if (!t) return null;

              const { theme, rgb, fallbackImg } = getThemeProps(t.game);

              return (
                <motion.div
                  key={reg._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="long-card"
                  style={{ '--theme-color': theme, '--theme-color-rgb': rgb }}
                >
                  {/* Left Section: Tournament Card */}
                  <div className="tournament-section">
                    {/* Background image/video */}
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

                    {/* Overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.95) 100%)',
                      zIndex: -1
                    }} />

                    {/* Status badge */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{
                        background: t.status === 'Upcoming' ? 'rgba(34,211,238,0.15)' : `${theme}30`,
                        border: `1px solid ${t.status === 'Upcoming' ? '#22d3ee' : theme}`,
                        color: t.status === 'Upcoming' ? '#22d3ee' : theme,
                        borderRadius: '50px',
                        padding: '0.3rem 0.9rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                      }}>
                        {t.status}
                      </span>
                    </div>

                    {/* Registration Status badge */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
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
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                      }}>
                        {reg.status === 'Pending' ? '⏳ Verification Pending' :
                          reg.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                      {reg.status === 'Rejected' && reg.rejectionReason && (
                        <div style={{
                          background: 'rgba(248,113,113,0.15)',
                          border: '1px solid #f87171',
                          borderRadius: '8px',
                          padding: '0.4rem 0.7rem',
                          maxWidth: '180px',
                          fontSize: '0.65rem',
                          color: '#fca5a5',
                          backdropFilter: 'blur(6px)',
                          lineHeight: 1.4
                        }}>
                          <strong>Reason:</strong> {reg.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
                        <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                        {t.date || 'TBA'}
                      </p>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>{t.name}</h3>

                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Prize Pool</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: theme }}>{t.prize ? `₹${t.prize}` : 'TBA'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Format</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{t.format || 'TBA'}</p>
                        </div>
                      </div>

                      <Link
                        to={`/tournaments/${t.slug || t._id}`}
                        state={{ fromDashboard: true }}
                        className="btn btn-primary"
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', color: theme, border: `1px solid ${theme}`, fontWeight: 700 }}
                      >
                        Explore Details
                      </Link>
                    </div>
                  </div>

                  {/* Right Section: Team Details */}
                  <div className="team-details-section">
                    <div className="team-header">
                      <div className="team-name-container">
                        <h2>{reg.teamName}</h2>
                        <p><FaUsers style={{ marginRight: '0.5rem' }} /> Registered Team</p>
                      </div>
                      <div className="igl-info">
                        <FaCrown style={{ color: theme, fontSize: '1.2rem' }} />
                        <div>
                          <span className="igl-badge" style={{ background: `${theme}30`, color: theme, border: `1px solid ${theme}` }}>IGL</span>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{reg.leaderName}</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{reg.leaderContact}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                        <FaInfoCircle style={{ marginRight: '0.5rem' }} /> Team Roster
                      </h4>
                      <div className="players-grid">
                        {reg.players && reg.players.map((player, idx) => (
                          <div key={idx} className="player-card" style={{ borderLeftColor: theme }}>
                            <div className="player-name">{player.name || 'Unknown Player'}</div>
                            <div className="player-ign">
                              <span style={{ color: theme, fontWeight: 700 }}>IGN:</span> {player.inGameName || 'N/A'}
                            </div>
                            {player.role && (
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                                Role: {player.role}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                        Registered on {new Date(reg.createdAt).toLocaleDateString()}
                      </div>
                      {reg.utrNumber && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                          UTR: <span style={{ color: theme }}>{reg.utrNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
