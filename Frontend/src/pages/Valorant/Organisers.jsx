import { Link, useLocation } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/PageLoader';
import BASE_URL from '../../config/api';

const ValorantOrganisers = () => {
  const { data: teams, loading, error } = useFetch(`${BASE_URL}/organizers?game=valorant`);
  const { user } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (error) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Error loading data</div>;

  if (!user) {
    return (
      <div className="container page-anim" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Restricted Access</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>You must be logged in to view Organisers.</p>
        <Link to="/login" state={{ from: location }} className="btn btn-primary" style={{ display: 'inline-block', width: 'auto' }}>
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to="/valorant" className="go-back-link" style={{ color: '#ff4655' }}>
        <span>&larr;</span> Back to Valorant
      </Link>
      <h1 className="title-gradient" style={{ marginBottom: '3rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Valorant Organising Teams</h1>

      <div className="grid-auto">
        {teams && teams.map(team => (
          <div key={team._id} className="glass-panel feature-card" style={{ padding: '1.5rem', borderTop: `4px solid ${team.color || '#ff4655'}` }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>{team.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>{team.description}</p>
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '-10px' }}>
                {team.members.slice(0, 3).map((m, i) => (
                  <div key={m._id || i} style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: '#30363d', border: '2px solid #161b22', marginLeft: i > 0 ? '-10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                  }}>
                    {m.name.charAt(0)}
                  </div>
                ))}
                {team.members.length > 3 && <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#21262d', border: '2px solid #161b22', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>+{team.members.length - 3}</div>}
              </div>
            </div>

            <Link to={`/valorant/organisers/${team.slug}`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', borderColor: team.color || '#ff4655', color: team.color || '#ff4655' }}>
              Know About More
            </Link>
          </div>
        ))}
        {teams && teams.length === 0 && <p>No organizing teams found.</p>}
      </div>
    </div>
  );
};

export default ValorantOrganisers;
