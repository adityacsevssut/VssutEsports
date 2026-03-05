import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config/api';
import PageLoader from '../../components/PageLoader';
import './TournamentRegistrations.css';

const TournamentRegistrations = () => {
  const { tournamentId } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch tournament details for heading
        const tRes = await fetch(`${BASE_URL}/tournaments/${tournamentId}`);
        if (tRes.ok) {
          setTournament(await tRes.json());
        }

        // Fetch registrations
        const rRes = await fetch(`${BASE_URL}/registrations/tournament/${tournamentId}`, config);
        if (rRes.ok) {
          setRegistrations(await rRes.json());
        } else {
          console.error("Failed to fetch registrations");
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [tournamentId, user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`${BASE_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setRegistrations(prev =>
          prev.map(reg => reg._id === id ? { ...reg, status: newStatus } : reg)
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  if (loading) return <PageLoader />;
  if (!tournament) return <div className="admin-container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Tournament Not Found or Access Denied</div>;

  return (
    <div className="admin-container page-anim" style={{ paddingTop: '8rem' }}>
      <div className="admin-header">
        <h1 className="title-gradient">{tournament.name} Registrations</h1>
        <Link to="/admin" className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', marginBottom: '4rem' }}>
        {registrations.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No registrations found for this tournament yet.</p>
        ) : (
          <table className="users-table registrations-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Team Name</th>
                <th>Leader Name</th>
                <th>Contact / Email</th>
                <th>Players (IGN | UID | College | RegNo | WhatsApp)</th>
                <th>Payment Info</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
                <tr key={reg._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 'bold' }}>{reg.teamName}</td>
                  <td>{reg.leaderName}</td>
                  <td>
                    {reg.leaderContact} <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reg.leaderEmail}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {reg.players && reg.players.map((p, i) => (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          <strong>{p.role}:</strong> {p.name} ({p.inGameName} | UID: {p.uid}) <br />
                          <span style={{ color: 'var(--text-muted)' }}>{p.college} - {p.regdNo} | WA: {p.whatsapp}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    {reg.utrNumber ? (
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>UTR:</strong> {reg.utrNumber} <br />
                        {reg.paymentScreenshot && reg.paymentScreenshot !== '-' ? (
                          <a href={reg.paymentScreenshot} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Screenshot</a>
                        ) : 'No Proof'}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span className="status-tag" style={{
                      background: reg.status === 'Approved' ? 'rgba(74, 222, 128, 0.2)' : reg.status === 'Rejected' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                      color: reg.status === 'Approved' ? '#4ade80' : reg.status === 'Rejected' ? '#f87171' : '#facc15',
                      border: '1px solid currentColor'
                    }}>
                      {reg.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={reg.status}
                      onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                      style={{
                        padding: '0.4rem',
                        borderRadius: '4px',
                        background: '#111',
                        color: '#fff',
                        border: '1px solid #333'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TournamentRegistrations;
