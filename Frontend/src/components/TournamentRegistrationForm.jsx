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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (numericPrice === 0) {
      return submitRegistrationData("Free Registration/Manual Proof");
    }

    if (tournament?.razorpayLink) {
      if (!formData.paymentScreenshot) {
        toast.error("Please upload your payment screenshot before submitting.");
        return;
      }
      return submitRegistrationData("direct_upi_payment_proof");
    }

    setIsSubmitting(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load. Are you connected to the internet?");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderRes = await fetch(`${BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericPrice, currency: "INR" }),
      });
      const order = await orderRes.json();

      if (!order || !order.id) {
        toast.warning(`Razorpay Gateway Error: ${order?.error?.description || 'Missing valid API Keys in Backend'}. Simulation Mode Active.`);
        setTimeout(() => {
          submitRegistrationData("simulated_pay_" + Math.floor(Math.random() * 9999999));
        }, 1500);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_pKVqGvSvwUfZZB',
        amount: order.amount,
        currency: order.currency,
        name: "VSSUT ESPORTS",
        description: `Registration for ${tournament.name}`,
        order_id: order.id,
        handler: async function (response) {
          await submitRegistrationData(response.razorpay_payment_id);
        },
        prefill: {
          name: formData['igl_0']?.name || '',
          email: user?.email || '',
          contact: formData['igl_0']?.mobile || '',
        },
        theme: {
          color: themeColor || "#8b5cf6",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        toast.error("Payment process failed: " + response.error.description);
        setIsSubmitting(false);
      });
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error("Error initiating payment sequence.");
      setIsSubmitting(false);
    }
  };

  const submitRegistrationData = async (paymentTransactionId) => {
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
      paymentScreenshot: paymentTransactionId
    };

    try {
      const res = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Registration Submitted Successfully!');
        onClose(true); // Pass true to indicate successful registration
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
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
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

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
          ) : tournament?.razorpayLink ? (
            <div className="payment-section">
              <h3 className="section-title" style={{ color: themeColor }}>💳 Complete Payment</h3>

              <div className="payment-card" style={{ '--theme-color': themeColor, '--theme-rgb': getComputedColor(themeColor) }}>
                <div className="payment-amount-ring">
                  <div className="payment-amount-inner">
                    <span className="payment-currency">₹</span>
                    <span className="payment-amount-value">{numericPrice}</span>
                  </div>
                </div>

                <p className="payment-instruction">Scan QR or click the button below to pay directly via UPI</p>

                <div className="payment-badges">
                  <span className="payment-badge">📱 UPI</span>
                  <span className="payment-badge">💳 Cards</span>
                  <span className="payment-badge">🏦 Net Banking</span>
                  <span className="payment-badge">👛 Wallets</span>
                </div>

                <a
                  href={tournament.razorpayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="razorpay-pay-btn"
                  style={{ '--theme-color': themeColor, '--theme-rgb': getComputedColor(themeColor) }}
                  onClick={() => setPaymentLinkOpened(true)}
                >
                  <span className="pay-btn-icon">⚡</span>
                  Pay ₹{numericPrice} via Razorpay
                  <span className="pay-btn-arrow">→</span>
                </a>

                <p className="payment-security-note">
                  🔒 Secured by Razorpay · 256-bit SSL Encryption
                </p>
              </div>

              {paymentLinkOpened && (
                <div className="payment-proof-zone" style={{ '--theme-color': themeColor }}>
                  <div className="proof-zone-header">
                    <span className="proof-zone-icon">📸</span>
                    <div>
                      <p className="proof-zone-title">Upload Payment Screenshot</p>
                      <p className="proof-zone-subtitle">After completing the payment, upload your confirmation screenshot below</p>
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
              )}
            </div>
          ) : (
            <div className="payment-section">
              <h3 className="section-title" style={{ color: themeColor }}>💳 Entry Fee
              </h3>
              <div className="payment-card" style={{ '--theme-color': themeColor, '--theme-rgb': getComputedColor(themeColor) }}>
                <div className="payment-amount-ring">
                  <div className="payment-amount-inner">
                    <span className="payment-currency">₹</span>
                    <span className="payment-amount-value">{numericPrice}</span>
                  </div>
                </div>
                <p className="payment-instruction">Payment will be processed securely via Razorpay Gateway</p>
                <div className="payment-badges">
                  <span className="payment-badge">📱 UPI</span>
                  <span className="payment-badge">💳 Cards</span>
                  <span className="payment-badge">👛 Wallets</span>
                </div>
                <p className="payment-security-note">🔒 Secured by Razorpay · 256-bit SSL Encryption</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
              style={{
                background: isSubmitting
                  ? `linear-gradient(90deg, ${themeColor} 0%, rgba(255,255,255,0.2) 50%, ${themeColor} 100%)`
                  : themeColor
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg style={{ animation: 'spin-ring 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 30" strokeLinecap="round"></circle>
                  </svg>
                  Processing...
                </span>
              ) : (
                tournament?.razorpayLink && numericPrice > 0
                  ? '✅ Confirm Registration'
                  : numericPrice > 0
                    ? `Pay ₹${numericPrice} & Register`
                    : 'Submit Registration'
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
