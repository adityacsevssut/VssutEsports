import { useState } from 'react';

const TournamentRegistrationForm = ({ tournament, onClose, themeColor }) => {
  const [formData, setFormData] = useState({
    igl: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player2: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player3: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player4: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player5: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    substitute: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    paymentScreenshot: null
  });

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, paymentScreenshot: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted', formData);
    alert('Registration Submitted Successfully! (This is a demo)');
    onClose();
  };

  const renderPlayerSection = (key, title) => (
    <div key={key} style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: themeColor, marginBottom: '1rem', fontSize: '1.2rem' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Full Name"
          required
          style={inputStyle}
          value={formData[key].name}
          onChange={(e) => handleChange(key, 'name', e.target.value)}
        />
        <input
          type="text"
          placeholder="College Name"
          required
          style={inputStyle}
          value={formData[key].college}
          onChange={(e) => handleChange(key, 'college', e.target.value)}
        />
        <input
          type="text"
          placeholder="Regd Number"
          required
          style={inputStyle}
          value={formData[key].regdNo}
          onChange={(e) => handleChange(key, 'regdNo', e.target.value)}
        />
        <input
          type="tel"
          placeholder="Mobile Number"
          required
          style={inputStyle}
          value={formData[key].mobile}
          onChange={(e) => handleChange(key, 'mobile', e.target.value)}
        />
        <input
          type="tel"
          placeholder="Whatsapp Number"
          required
          style={inputStyle}
          value={formData[key].whatsapp}
          onChange={(e) => handleChange(key, 'whatsapp', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div style={overlayStyle}>
      <div className="glass-panel" style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Register for {tournament.name}</h2>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {renderPlayerSection('igl', 'IGL (Captain) Details')}
          {renderPlayerSection('player2', 'Player 2 Details')}
          {renderPlayerSection('player3', 'Player 3 Details')}
          {renderPlayerSection('player4', 'Player 4 Details')}
          {renderPlayerSection('player5', 'Player 5 Details')}
          {renderPlayerSection('substitute', 'Substitute Player Details')}

          <div style={{ marginBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <h3 style={{ color: themeColor, marginBottom: '1rem', fontSize: '1.2rem' }}>Payment Proof</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Please upload a screenshot of your payment.
              </p>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                style={{ ...inputStyle, padding: '0.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--text-muted)', color: 'white' }}>
              Cancel
            </button>
            <button type="submit" className="btn" style={{ width: 'auto', background: themeColor, color: 'white' }}>
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(5px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem'
};

const modalStyle = {
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
  padding: 0 // Padding inside form
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  background: 'rgba(22, 27, 34, 0.95)',
  padding: '1.5rem 2rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '2rem',
  cursor: 'pointer',
  lineHeight: 1
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: 'white',
  fontFamily: 'inherit',
  fontSize: '0.9rem'
};

export default TournamentRegistrationForm;
