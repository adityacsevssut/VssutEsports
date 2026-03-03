import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';
import TournamentForm from './TournamentForm';
import OrganizerForm from './OrganizerForm';
import PartnerForm from './PartnerForm';
import BASE_URL from '../../config/api';

const AdminDashboard = () => {
  const { user, isDeveloper } = useAuth();

  // For Partners: predefined game based on role (e.g. 'partner_freefire' -> 'freefire')
  const partnerGame = !isDeveloper && user?.role?.startsWith('partner_')
    ? user.role.replace('partner_', '')
    : null;

  const [activeTab, setActiveTab] = useState(isDeveloper ? 'partners' : 'tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDeveloper) {
        if (activeTab === 'users') {
          const res = await fetch(`${BASE_URL}/auth/players`);
          setUsersList(await res.json());
        } else if (activeTab === 'partners') {
          const res = await fetch(`${BASE_URL}/auth/partners`);
          setPartners(await res.json());
        }
      } else if (partnerGame) {
        // Partner trying to fetch tournaments/organizers
        const endpoint = activeTab === 'tournaments' ? 'tournaments' : 'organizers';
        const res = await fetch(`${BASE_URL}/${endpoint}?game=${partnerGame}`);
        const data = await res.json();
        if (activeTab === 'tournaments') {
          setTournaments(data);
        } else {
          setOrganizers(data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
      setShowForm(false);
    }
  }, [activeTab, user]);

  const handleSubmitData = async (data) => {
    try {
      let endpoint = '';
      if (isDeveloper && activeTab === 'partners') endpoint = 'auth/partners';
      else endpoint = activeTab === 'tournaments' ? 'tournaments' : 'organizers';

      if (activeTab === 'tournaments' && data.includeOrganizer) {
        let orgSlug = data.organisingTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const orgData = {
          ...data.organizer,
          game: data.game,
          name: data.organisingTeam,
          slug: orgSlug
        };

        // We attempt to PUT (update) first, if not found or err POST.
        // Actually, we can just POST if creating new, and PUT if editing.
        const orgMethod = editingData ? 'PUT' : 'POST';
        const orgUrl = editingData
          ? `${BASE_URL}/organizers/${orgSlug}`
          : `${BASE_URL}/organizers`;

        await fetch(orgUrl, {
          method: orgMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orgData)
        });

        // Link the saved organizer slug to the tournament
        data.organisingTeam = orgSlug;
      }

      // Cleanup extra frontend-only fields
      const submitData = { ...data };
      delete submitData.includeOrganizer;
      delete submitData.organizer;

      const method = editingData ? 'PUT' : 'POST';
      const url = editingData
        ? `${BASE_URL}/${endpoint}/${editingData._id}`
        : `${BASE_URL}/${endpoint}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingData(null);
        fetchData();
      } else {
        const responseData = await res.json();
        alert(responseData.message || `Failed to ${editingData ? 'update' : 'create'} entry`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Check console.");
    }
  };

  const handleEdit = (item) => {
    setEditingData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      let endpoint = '';
      if (isDeveloper && activeTab === 'partners') endpoint = 'auth/partners';
      else if (isDeveloper && activeTab === 'users') endpoint = 'auth/players';
      else endpoint = activeTab === 'tournaments' ? 'tournaments' : 'organizers';

      const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("Network error while deleting");
    }
  }

  // ── DEVELOPER VIEW (Only sees Partners & Users) ─────────────
  if (isDeveloper) {
    return (
      <div className="admin-container page-anim" style={{ paddingTop: '8rem' }}>
        <div className="admin-header">
          <h1 className="title-gradient">Developer Control Panel</h1>
        </div>

        <div className="admin-controls">
          <div className="tab-selector">
            <button
              className={`tab-btn ${activeTab === 'partners' ? 'title-gradient' : ''}`}
              onClick={() => { setActiveTab('partners'); setShowForm(false); }}
            >
              Partners
            </button>
            <button
              className={`tab-btn ${activeTab === 'users' ? 'title-gradient' : ''}`}
              onClick={() => { setActiveTab('users'); setShowForm(false); }}
            >
              Users
            </button>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'partners' && (
            <>
              <div className="content-header">
                <h2>Manage System Partners</h2>
                {!showForm && (
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>+ Add Partner</button>
                )}
              </div>

              {showForm ? (
                <PartnerForm onSubmit={handleSubmitData} onCancel={() => { setShowForm(false); setEditingData(null); }} initialData={editingData} />
              ) : (
                <div className="data-list">
                  {loading ? <p>Loading...</p> : (
                    partners.length === 0 ? <p className="no-data">No partners found.</p> :
                      partners.map(p => (
                        <div key={p._id} className="data-item glass-panel" style={{ borderLeft: `4px solid #8b5cf6` }}>
                          <div className="item-info">
                            <h3>{p.name}</h3>
                            <div className="tags">
                              <span><strong>Game:</strong> {p.role.replace('partner_', '').toUpperCase()}</span>
                              <span>{p.email}</span>
                              <span className="status-tag" style={{ background: '#4ade80', color: '#0d1117', fontWeight: 'bold' }}>
                                {p.organisingId}
                              </span>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button className="btn-text-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="content-header">
                <h2>Registered Players</h2>
              </div>
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? <p style={{ padding: '2rem' }}>Loading users...</p> : (
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.length > 0 ? (
                          usersList.map((u) => (
                            <tr key={u._id}>
                              <td>{u.firstName} {u.lastName}</td>
                              <td>{u.email}</td>
                              <td>{u.mobileNumber}</td>
                              <td><span className="status-tag" style={{ background: '#8b5cf6' }}>Player</span></td>
                              <td>
                                <button className="btn-text-danger" style={{ padding: 0 }} onClick={() => handleDelete(u._id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No registered players found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── PARTNER VIEW (e.g. FreeFire Partner) ────────────────────
  if (partnerGame) {
    return (
      <div className="admin-container page-anim" style={{ paddingTop: '8rem' }}>
        <div className="admin-header">
          <h1 className="title-gradient">{partnerGame.toUpperCase()} Partner Panel</h1>
        </div>

        <div className="admin-controls">
          <div className="tab-selector">
            <button
              className={`tab-btn ${activeTab === 'tournaments' ? 'title-gradient' : ''}`}
              onClick={() => { setActiveTab('tournaments'); setShowForm(false); setEditingData(null); }}
            >
              Tournaments
            </button>
            <button
              className={`tab-btn ${activeTab === 'organizers' ? 'title-gradient' : ''}`}
              onClick={() => { setActiveTab('organizers'); setShowForm(false); setEditingData(null); }}
            >
              Organizers
            </button>
          </div>
        </div>

        <div className="admin-content">
          <div className="content-header">
            <h2>Managing {partnerGame} {activeTab}</h2>
            {!showForm && (
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>+ Add New</button>
            )}
          </div>

          {showForm ? (
            activeTab === 'tournaments' ? (
              <TournamentForm game={partnerGame} onSubmit={handleSubmitData} onCancel={() => { setShowForm(false); setEditingData(null); }} initialData={editingData} />
            ) : (
              <OrganizerForm game={partnerGame} onSubmit={handleSubmitData} onCancel={() => { setShowForm(false); setEditingData(null); }} initialData={editingData} />
            )
          ) : (
            <div className="data-list">
              {loading ? <p>Loading...</p> : (
                activeTab === 'tournaments' ? (
                  tournaments.length === 0 ? <p className="no-data">No tournaments found.</p> :
                    tournaments.map(t => (
                      <div key={t._id} className="data-item glass-panel">
                        <div className="item-info">
                          <h3>{t.name}</h3>
                          <div className="tags">
                            <span className={`status-tag ${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button className="btn-text" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn-text-danger" onClick={() => handleDelete(t._id)}>Delete</button>
                        </div>
                      </div>
                    ))
                ) : (
                  organizers.length === 0 ? <p className="no-data">No organizers found.</p> :
                    organizers.map(o => (
                      <div key={o._id} className="data-item glass-panel" style={{ borderLeft: `4px solid ${o.color}` }}>
                        <div className="item-info">
                          <h3>{o.name}</h3>
                          <p>{o.members.length} members</p>
                        </div>
                        <div className="item-actions">
                          <button className="btn-text-danger" onClick={() => handleDelete(o._id)}>Delete</button>
                        </div>
                      </div>
                    ))
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FALLBACK ──────────────────────────────────────────────
  // If not developer and not partner, shouldn't really be here, but just in case:
  return (
    <div className="admin-container page-anim" style={{ paddingTop: '8rem', textAlign: 'center' }}>
      <h1 className="title-gradient">Access Denied</h1>
      <p style={{ color: 'var(--text-muted)' }}>You do not have permission to view this page.</p>
    </div>
  );
};

export default AdminDashboard;
