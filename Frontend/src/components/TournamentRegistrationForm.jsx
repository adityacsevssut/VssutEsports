import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './TournamentRegistrationForm.css';
import BASE_URL from '../config/api';

const TournamentRegistrationForm = ({ tournament, onClose, themeColor }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({});
  const [requiredKeys, setRequiredKeys] = useState([]);
  const [playerSections, setPlayerSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentLinkOpened, setPaymentLinkOpened] = useState(false);

  useEffect(() => {
    let iglCount = 1;
    let playerCount = 3;
    let subCount = 1;

    if (tournament?.playerFormat === 'Solo') {
      playerCount = 0;
      subCount = 1;
    } else if (tournament?.playerFormat === 'Duo') {
      playerCount = 1;
      subCount = 1;
    } else if (tournament?.playerFormat === 'Squad') {
      playerCount = 3;
      subCount = 1;
    } else if (tournament?.playerFormat === 'Custom') {
      iglCount = tournament.customIglCount ?? 1;
      playerCount = tournament.customPlayerCount ?? 3;
      subCount = tournament.customSubstituteCount ?? 1;
    }

    const initialData = {};
    const reqKeys = [];
    const sections = [];

    // IGLs
    for (let i = 0; i < iglCount; i++) {
      const key = `igl_${i}`;
      initialData[key] = {
        name: '',
        email: (i === 0 && user) ? user.email : '',
        inGameName: '',
        uid: '',
        college: '',
        regdNo: '',
        mobile: '',
        whatsapp: '',
        role: 'IGL'
      };
      reqKeys.push(key);
      sections.push({ key, title: i === 0 ? 'IGL (Captain) Details' : `IGL ${i + 1} Details`, isIgl: i === 0 });
    }

    // Players
    for (let i = 0; i < playerCount; i++) {
      const key = `player_${i}`;
      initialData[key] = { name: '', email: '', inGameName: '', uid: '', college: '', regdNo: '', mobile: '', whatsapp: '', role: 'Player' };
      reqKeys.push(key);
      sections.push({ key, title: `Player ${i + 2} Details`, isIgl: false }); // i + 2 assuming 1 IGL
    }

    // Substitutes
    for (let i = 0; i < subCount; i++) {
      const key = `substitute_${i}`;
      initialData[key] = { name: '', email: '', inGameName: '', uid: '', college: '', regdNo: '', mobile: '', whatsapp: '', role: 'Substitute' };
      sections.push({ key, title: `Substitute ${subCount > 1 ? i + 1 : ''} Details`, isIgl: false });
    }

    initialData.paymentScreenshot = null;
    initialData.utrNumber = '';

    setFormData(initialData);
    setRequiredKeys(reqKeys);
    setPlayerSections(sections);
  }, [tournament, user]);

  if (!formData || Object.keys(formData).length === 0) return null;

  const validateForm = () => {
    // Only validating required players (IGLs + Main Players)
    for (const key of requiredKeys) {
      const p = formData[key];
      const sectionInfo = playerSections.find(s => s.key === key);
      const label = sectionInfo?.title || 'Player';

      if (!p.name.trim()) { toast.error(`${label}: Full Name is required.`); return false; }
      if (!p.email.trim()) { toast.error(`${label}: Email is required.`); return false; }
      if (!p.inGameName.trim()) { toast.error(`${label}: In-Game Name is required.`); return false; }
      if (!p.uid.trim()) { toast.error(`${label}: In-Game UID is required.`); return false; }
      if (!p.college.trim()) { toast.error(`${label}: College Name is required.`); return false; }
      if (!p.regdNo.trim()) { toast.error(`${label}: College Registration Number is required.`); return false; }
      if (!p.mobile.trim()) { toast.error(`${label}: Mobile Number is required.`); return false; }
      if (!p.whatsapp.trim()) { toast.error(`${label}: WhatsApp Number is required.`); return false; }
    }
    return true;
  };

  let numericPrice = 0;
  if (tournament?.pricePerTeam && tournament.pricePerTeam.toLowerCase() !== 'free') {
    const match = tournament.pricePerTeam.match(/\d+/);
    if (match) {
      numericPrice = parseInt(match[0], 10);
    }
  }

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, paymentScreenshot: e.target.files[0] }));
  };

  const handleUtrChange = (e) => {
    setFormData(prev => ({ ...prev, utrNumber: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (numericPrice === 0) {
      return submitRegistrationData("Free Registration/Manual Proof", "N/A");
    }

    if (numericPrice > 0) {
      if (!formData.paymentScreenshot) {
        toast.error("Please upload your payment screenshot before submitting.");
        return;
      }
      if (!formData.utrNumber || formData.utrNumber.trim() === '') {
        toast.error("Please enter the UTR/Transaction Number.");
        return;
      }
      return uploadScreenshotAndSubmit();
    }
  };

  const uploadScreenshotAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Dynamic import to avoid loading supabase if not needed immediately
      const { supabase, supabaseUrl } = await import('../services/supabaseClient.js');

      if (supabaseUrl === 'https://placeholder.supabase.co') {
        toast.error("Supabase is not configured!");
        setIsSubmitting(false);
        return;
      }

      const file = formData.paymentScreenshot;
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { error } = await supabase.storage
        .from('tournaments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath);

      submitRegistrationData(publicUrl, formData.utrNumber);

    } catch (err) {
      console.error('Error uploading payment screenshot:', err);
      toast.error('Failed to upload payment screenshot. Please try again.');
      setIsSubmitting(false);
    }
  };

  const submitRegistrationData = async (paymentProofUrl, utrNumber) => {
    setIsSubmitting(true);

    const players = playerSections.map(s => formData[s.key]).filter(p => p.name && p.name.trim());

    const leaderName = formData['igl_0']?.name || 'Unknown';
    const leaderContact = formData['igl_0']?.mobile || '';

    const payload = {
      tournamentId: tournament._id,
      teamName: `${leaderName}'s Team`,
      leaderName: leaderName,
      leaderContact: leaderContact,
      leaderEmail: user ? user.email : '',
      players: players.map(p => ({
        name: p.name,
        inGameName: p.inGameName,
        uid: p.uid,
        regdNo: p.regdNo,
        email: p.email,
        mobile: p.mobile,
        whatsapp: p.whatsapp,
        college: p.college,
        role: p.role
      })),
      paymentScreenshot: paymentProofUrl,
      utrNumber: utrNumber
    };

    try {
      const res = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success('Registration Submitted Successfully!');

        // Wait 1.5 seconds so the user sees the "✅ Registration Done" button state before closing
        setTimeout(() => {
          onClose(true);
        }, 1500);

      } else {
        setIsSubmitting(false);
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Network error, please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlayerSection = (key, title, isIgl) => {
    const isRequired = requiredKeys.includes(key);
    return (
      <div key={key} style={{ marginBottom: '2.5rem' }}>
        <h3 className="section-title" style={{ color: themeColor }}>{title} {!isRequired && '(Optional)'}</h3>
        <div className="inputs-grid">
          <div className="input-group">
            <input
              type="text"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.name || ''}
              onChange={(e) => handleChange(key, 'name', e.target.value)}
            />
            <label className="input-label">Full Name {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="email"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.email || ''}
              onChange={(e) => handleChange(key, 'email', e.target.value)}
              disabled={isIgl && user} // IGL email is auto-filled and read-only if logged in
              title={isIgl && user ? "Automatically filled with your login email" : ""}
            />
            <label className="input-label">Email {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.inGameName || ''}
              onChange={(e) => handleChange(key, 'inGameName', e.target.value)}
            />
            <label className="input-label">In-Game Name {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.uid || ''}
              onChange={(e) => handleChange(key, 'uid', e.target.value)}
            />
            <label className="input-label">In-Game UID {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.college || ''}
              onChange={(e) => handleChange(key, 'college', e.target.value)}
            />
            <label className="input-label">College Name {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.regdNo || ''}
              onChange={(e) => handleChange(key, 'regdNo', e.target.value)}
            />
            <label className="input-label">College Registration No. {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="tel"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.mobile || ''}
              onChange={(e) => handleChange(key, 'mobile', e.target.value)}
            />
            <label className="input-label">Mobile Number {isRequired ? '*' : ''}</label>
          </div>
          <div className="input-group">
            <input
              type="tel"
              className="fancy-input"
              style={{ '--theme-color': themeColor }}
              placeholder=" "
              required={isRequired}
              value={formData[key]?.whatsapp || ''}
              onChange={(e) => handleChange(key, 'whatsapp', e.target.value)}
            />
            <label className="input-label">WhatsApp Number {isRequired ? '*' : ''}</label>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="modal-overlay" style={{ '--theme-color': themeColor, '--theme-color-rgb': getComputedColor(themeColor) }}>
      <div className="form-container">
        <div className="form-header">
          <h2>Register for {tournament.name}</h2>
          <button onClick={() => onClose(false)} className="close-btn">&times;</button>
        </div>

        <p style={{ textAlign: 'center', color: '#ff4655', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
          * All fields are required completely except for substitute players.
        </p>

        <form onSubmit={handleSubmit} className="registration-form">
          {playerSections.map(s => renderPlayerSection(s.key, s.title, s.isIgl))}

          {numericPrice === 0 ? (
            <div className="payment-section">
              <h3 className="section-title" style={{ color: themeColor }}>Payment Proof</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Please upload a clear screenshot of your transaction.
              </p>
              <div className="file-upload-wrapper" style={{ '--theme-color': themeColor }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="upload-icon">
                  {formData.paymentScreenshot ? '✓' : '⇧'}
                </div>
                <span className="upload-text">
                  {formData.paymentScreenshot && formData.paymentScreenshot.name ? formData.paymentScreenshot.name : 'Click or drag file to upload here'}
                </span>
              </div>
            </div>
          ) : (
            <div className="payment-section">
              <h3 className="section-title" style={{ color: themeColor }}>💳 Complete Payment</h3>

              <div className="payment-card" style={{ '--theme-color': themeColor, '--theme-rgb': getComputedColor(themeColor), padding: '2rem' }}>
                <h4 style={{ textAlign: 'center', margin: '0 0 1rem 0', fontSize: '1.4rem', color: themeColor }}>
                  Entry Fee: ₹{numericPrice}
                </h4>
                <p className="payment-instruction" style={{ marginBottom: '1.5rem', fontWeight: 500 }}>
                  Scan the QR code below to pay the entry fee
                </p>

                {tournament?.qrCodeUrl ? (
                  <div style={{ textAlign: 'center', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={tournament.qrCodeUrl}
                      alt="Payment QR Code"
                      style={{
                        maxWidth: '220px',
                        width: '100%',
                        objectFit: 'contain',
                        borderRadius: '16px',
                        border: `4px solid ${themeColor}`,
                        padding: '0.8rem',
                        background: '#fff',
                        boxShadow: `0 8px 30px -5px ${themeColor}60`
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', margin: '2rem 0', color: '#ff4655', padding: '1rem', background: 'rgba(255, 70, 85, 0.1)', borderRadius: '12px', border: '1px solid #ff4655' }}>
                    ⚠️ Organizer has not uploaded a payment QR code yet. Please contact them.
                  </div>
                )}

                <div className="payment-badges" style={{ marginTop: '1.5rem' }}>
                  <span className="payment-badge">📱 UPI Only</span>
                  <span className="payment-badge">🏦 Safe</span>
                </div>
              </div>

              <div className="payment-proof-zone" style={{ '--theme-color': themeColor, marginTop: '2rem' }}>
                <div className="proof-zone-header" style={{ marginBottom: '1rem' }}>
                  <span className="proof-zone-icon">🔢</span>
                  <div>
                    <p className="proof-zone-title">Transaction ID / UTR Number</p>
                    <p className="proof-zone-subtitle">Enter the 12-digit UTR from your UPI app</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.utrNumber || ''}
                  onChange={handleUtrChange}
                  placeholder="e.g. 314059284..."
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: `1px solid ${themeColor}`, background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}
                  required
                />

                <div className="proof-zone-header">
                  <span className="proof-zone-icon">📸</span>
                  <div>
                    <p className="proof-zone-title">Upload Payment Screenshot</p>
                    <p className="proof-zone-subtitle">Upload your confirmation screenshot</p>
                  </div>
                </div>
                <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, marginTop: '1rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    required
                  />
                  <div className="upload-icon">
                    {formData.paymentScreenshot ? '✅' : '⇧'}
                  </div>
                  <span className="upload-text">
                    {formData.paymentScreenshot && formData.paymentScreenshot.name
                      ? `✓ ${formData.paymentScreenshot.name}`
                      : 'Click or drag your payment screenshot here'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => onClose(false)} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="submit-btn"
              style={{
                background: isSuccess
                  ? '#10b981' // Green for success
                  : isSubmitting
                    ? `linear-gradient(90deg, ${themeColor} 0%, rgba(255,255,255,0.2) 50%, ${themeColor} 100%)`
                    : themeColor,
                transition: 'all 0.3s ease'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg style={{ animation: 'spin-ring 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 30" strokeLinecap="round"></circle>
                  </svg>
                  Processing...
                </span>
              ) : isSuccess ? (
                '✅ Registration Done'
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getComputedColor(color) {
  if (color === '#ff4655') return '255, 70, 85';
  if (color === '#f97316') return '249, 115, 22';
  if (color === '#ec4899') return '236, 72, 153';
  return '255, 255, 255';
}

export default TournamentRegistrationForm;
