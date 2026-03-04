import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import BASE_URL from '../../config/api';

const BGMITeamDetails = () => {
  const { teamId } = useParams();
  const { data: team, loading, error } = useFetch(`${BASE_URL}/organizers/${teamId}`);

  if (loading) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>;

  if (error || !team) {
    return (
      <div className="container page-anim" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1>Team Not Found</h1>
        <Link to="/bgmi/organisers" className="btn btn-primary">Back to Organisers</Link>
      </div>
    );
  }

  return (
    <div className="container page-anim" style={{ paddingTop: '8rem' }}>
      <Link to="/bgmi/organisers" className="go-back-link" style={{ color: team.color }}>
        <span>&larr;</span> Back to Teams
      </Link>

      <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', borderTop: `4px solid ${team.color}` }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{team.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{team.description}</p>
      </div>

      <div className="grid-auto">
        {team.members && team.members.map((member, idx) => (
          <div key={member._id || idx} className="glass-panel" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '80px', background: `linear-gradient(135deg, ${team.color}22, transparent)` }}></div>
            <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-40px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#161b22',
                border: `3px solid ${team.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {member.name.charAt(0)}
              </div>

              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem' }}>{member.name}</h3>
              <p style={{ textAlign: 'center', color: team.color, fontWeight: '600', marginBottom: '2rem' }}>{member.role}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <InfoRow label="Mobile" value={member.mobile} />
                <InfoRow label="Year" value={member.year} />
                <InfoRow label="Branch" value={member.branch} />
                <InfoRow label="College" value={member.college} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontWeight: '500' }}>{value}</span>
  </div>
);

export default BGMITeamDetails;
