import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin/AdminDashboard.css'; // Reusing admin styles for consistency or create new
import BASE_URL from '../config/api';

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
        <header className="dashboard-header">
          <h1>My Tournament Registrations</h1>
          <p>Welcome back, {user?.name || user?.firstName || 'Player'}</p>
        </header>

        {registrations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3>You haven't enrolled in any tournaments yet.</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Join a tournament to see your status here.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/freefire" className="btn btn-primary" style={{ width: 'auto' }}>Browse FreeFire</Link>
              <Link to="/bgmi" className="btn btn-primary" style={{ width: 'auto' }}>Browse BGMI</Link>
              <Link to="/valorant" className="btn btn-primary" style={{ width: 'auto' }}>Browse Valorant</Link>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            {registrations.map((reg) => (
              <div key={reg._id} className="glass-panel card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    background: reg.status === 'Approved' ? 'rgba(74, 222, 128, 0.2)' :
                      reg.status === 'Rejected' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                    color: reg.status === 'Approved' ? '#4ade80' :
                      reg.status === 'Rejected' ? '#f87171' : '#facc15',
                    border: '1px solid currentColor'
                  }}>
                    {reg.status}
                  </span>
                </div>
                <h3>{reg.tournamentId?.name || 'Tournament'}</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {reg.tournamentId?.game?.toUpperCase()} • {new Date(reg.createdAt).toLocaleDateString()}
                </p>

                <div className="card-row">
                  <span className="card-label">Team Name:</span>
                  <span className="card-value">{reg.teamName}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Date:</span>
                  <span className="card-value">{reg.tournamentId?.date || 'TBA'}</span>
                </div>

                <Link to={`/tournaments/${reg.tournamentId?._id}`} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                  View Tournament
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
