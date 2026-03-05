import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config/api';
import PageLoader from '../../components/PageLoader';
import * as XLSX from 'xlsx';
import './TournamentRegistrations.css';

const TournamentRegistrations = () => {
  const { tournamentId } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectInputs, setRejectInputs] = useState({});
  const [showXlModal, setShowXlModal] = useState(false);

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
    if (newStatus === 'Rejected') {
      // Show the rejection reason textarea instead of immediately submitting
      setRejectInputs(prev => ({ ...prev, [id]: { show: true, reason: prev[id]?.reason || '' } }));
      return;
    }
    await submitStatusUpdate(id, newStatus, '');
  };

  const submitStatusUpdate = async (id, newStatus, rejectionReason) => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`${BASE_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, rejectionReason })
      });

      if (res.ok) {
        setRegistrations(prev =>
          prev.map(reg => reg._id === id ? { ...reg, status: newStatus, rejectionReason } : reg)
        );
        // Clear reject input state
        setRejectInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
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

  const maxPlayers = Math.max(0, ...registrations.map(r => r.players?.length || 0));
  const playerColumns = [];
  for (let i = 0; i < maxPlayers; i++) playerColumns.push(i);

  // Build flat row data for Excel export
  const buildRowData = () => {
    return registrations.map((reg, index) => {
      const row = {
        'S.No': index + 1,
        'Team Name': reg.teamName || '',
        'Leader Name': reg.leaderName || '',
        'Leader Contact': reg.leaderContact || '',
        'Leader Email': reg.leaderEmail || '',
      };
      playerColumns.forEach(i => {
        const p = reg.players && reg.players[i];
        row[`P${i + 1} Role`] = p?.role || '-';
        row[`P${i + 1} Name`] = p?.name || '-';
        row[`P${i + 1} IGN`] = p?.inGameName || '-';
        row[`P${i + 1} UID`] = p?.uid || '-';
        row[`P${i + 1} College`] = p?.college || '-';
        row[`P${i + 1} RegNo`] = p?.regdNo || '-';
        row[`P${i + 1} WhatsApp`] = p?.whatsapp || '-';
      });
      row['UTR Number'] = reg.utrNumber || 'N/A';
      row['Payment Proof'] = reg.paymentScreenshot && reg.paymentScreenshot !== '-' ? reg.paymentScreenshot : 'No Proof';
      row['Status'] = reg.status || '';
      row['Rejection Reason'] = reg.rejectionReason || '';
      return row;
    });
  };

  const handleDownloadXL = () => {
    const rows = buildRowData();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    XLSX.writeFile(wb, `${tournament.name}_Registrations.xlsx`);
  };

  return (
    <div className="admin-container page-anim" style={{ paddingTop: '8rem' }}>
      <div className="admin-header">
        <h1 className="title-gradient">{tournament.name} Registrations</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {registrations.length > 0 && (
            <>
              <button
                onClick={handleDownloadXL}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.4rem', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', width: 'auto'
                }}
              >
                ⬇️ Download XL
              </button>
              <button
                onClick={() => setShowXlModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.4rem', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', width: 'auto'
                }}
              >
                👁️ View XL
              </button>
            </>
          )}
          <Link to="/admin" className="btn btn-primary" style={{ width: 'auto' }}>
            Back to Dashboard
          </Link>
        </div>
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
                <th>Leader Contact</th>
                <th>Leader Email</th>
                {playerColumns.map(i => (
                  <React.Fragment key={i}>
                    <th>P{i + 1} Role</th>
                    <th>P{i + 1} Name</th>
                    <th>P{i + 1} IGN</th>
                    <th>P{i + 1} UID</th>
                    <th>P{i + 1} College</th>
                    <th>P{i + 1} RegNo</th>
                    <th>P{i + 1} WhatsApp</th>
                  </React.Fragment>
                ))}
                <th>UTR Number</th>
                <th>Payment Proof</th>
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
                  <td>{reg.leaderContact}</td>
                  <td>{reg.leaderEmail}</td>

                  {playerColumns.map(i => {
                    const p = reg.players && reg.players[i];
                    if (p) {
                      return (
                        <React.Fragment key={i}>
                          <td>{p.role}</td>
                          <td>{p.name}</td>
                          <td>{p.inGameName}</td>
                          <td>{p.uid}</td>
                          <td>{p.college}</td>
                          <td>{p.regdNo}</td>
                          <td>{p.whatsapp}</td>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <React.Fragment key={i}>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                          <td style={{ color: 'var(--text-muted)' }}>-</td>
                        </React.Fragment>
                      );
                    }
                  })}

                  <td>
                    {reg.utrNumber ? reg.utrNumber : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                  </td>
                  <td>
                    {reg.paymentScreenshot && reg.paymentScreenshot !== '-' ? (
                      <a href={reg.paymentScreenshot} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Proof</span>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
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

                      {rejectInputs[reg._id]?.show && (
                        <>
                          <textarea
                            rows={3}
                            placeholder="Enter rejection reason..."
                            value={rejectInputs[reg._id]?.reason || ''}
                            onChange={(e) => setRejectInputs(prev => ({
                              ...prev,
                              [reg._id]: { ...prev[reg._id], reason: e.target.value }
                            }))}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              background: '#1a1a1a',
                              color: '#fff',
                              border: '1px solid #f87171',
                              resize: 'vertical',
                              fontSize: '0.85rem'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                const reason = rejectInputs[reg._id]?.reason?.trim();
                                if (!reason) { alert('Please enter a rejection reason.'); return; }
                                submitStatusUpdate(reg._id, 'Rejected', reason);
                              }}
                              style={{
                                flex: 1, padding: '0.35rem', borderRadius: '4px',
                                background: '#f87171', color: '#fff',
                                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
                              }}
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => setRejectInputs(prev => { const n = { ...prev }; delete n[reg._id]; return n; })}
                              style={{
                                padding: '0.35rem 0.6rem', borderRadius: '4px',
                                background: '#333', color: '#fff',
                                border: 'none', cursor: 'pointer', fontSize: '0.8rem'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      )}

                      {reg.rejectionReason && reg.status === 'Rejected' && (
                        <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '3px solid #f87171' }}>
                          <strong>Reason:</strong> {reg.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── XL Preview Modal ── */}
      {showXlModal && (() => {
        const rows = buildRowData();
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', flexDirection: 'column',
            padding: '1.5rem'
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>
                  📊 {tournament.name} — Registration Sheet Preview
                </h2>
                <span style={{ background: '#22c55e33', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '50px', padding: '0.2rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  {rows.length} Teams
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={handleDownloadXL}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  ⬇️ Download XL
                </button>
                <button
                  onClick={() => setShowXlModal(false)}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Spreadsheet preview */}
            <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                <thead>
                  <tr>
                    {headers.map(h => (
                      <th key={h} style={{
                        background: '#1e3a5f', color: '#93c5fd',
                        padding: '0.6rem 1rem', whiteSpace: 'nowrap',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        borderBottom: '2px solid #3b82f6',
                        fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                        position: 'sticky', top: 0, zIndex: 2
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#0d1117' : '#111827' }}>
                      {headers.map(h => (
                        <td key={h} style={{
                          padding: '0.5rem 1rem', color: '#e2e8f0',
                          borderRight: '1px solid rgba(255,255,255,0.05)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          whiteSpace: 'nowrap',
                          maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis'
                        }} title={String(row[h])}>
                          {h === 'Status' ? (
                            <span style={{
                              padding: '0.15rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                              background: row[h] === 'Approved' ? 'rgba(74,222,128,0.2)' : row[h] === 'Rejected' ? 'rgba(248,113,113,0.2)' : 'rgba(250,204,21,0.2)',
                              color: row[h] === 'Approved' ? '#4ade80' : row[h] === 'Rejected' ? '#f87171' : '#facc15'
                            }}>
                              {row[h]}
                            </span>
                          ) : String(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TournamentRegistrations;
