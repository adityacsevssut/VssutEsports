import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './TournamentRegistrationForm.css';
import BASE_URL from '../config/api';

const TournamentRegistrationForm = ({ tournament, onClose, themeColor }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    igl: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player2: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player3: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player4: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    player5: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    substitute: { name: '', college: '', regdNo: '', mobile: '', whatsapp: '' },
    paymentScreenshot: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLinkOpened, setPaymentLinkOpened] = useState(false);

  // Required players: IGL + players 2-5 (substitute is optional)
  const REQUIRED_PLAYERS = ['igl', 'player2', 'player3', 'player4', 'player5'];

  /* Validate all required player fields before submission */
  const validateForm = () => {
    for (const key of REQUIRED_PLAYERS) {
      const p = formData[key];
      const label = key === 'igl' ? 'IGL (Captain)' : `Player ${key.replace('player', '')}`;
      if (!p.name.trim()) { toast.error(`${label}: Full Name is required.`); return false; }
      if (!p.college.trim()) { toast.error(`${label}: College Name is required.`); return false; }
      if (!p.regdNo.trim()) { toast.error(`${label}: Registration Number is required.`); return false; }
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

    // If free tournament
    if (numericPrice === 0) {
      return submitRegistrationData("Free Registration/Manual Proof");
    }

    // If partner has set a direct Razorpay/UPI link — require screenshot proof
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
        // If razorpay backend failed (typically missing API keys), we fallback to simulation for dev purposes
        toast.warning(`Razorpay Gateway Error: ${order?.error?.description || 'Missing valid API Keys in Backend'}. Simulation Mode Active.`);

        // Simulating the transaction callback
        setTimeout(() => {
          submitRegistrationData("simulated_pay_" + Math.floor(Math.random() * 9999999));
        }, 1500);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_pKVqGvSvwUfZZB', // Falls back to test key if env is missing
        amount: order.amount,
        currency: order.currency,
        name: "VSSUT ESPORTS",
        description: `Registration for ${tournament.name}`,
        order_id: order.id,
        handler: async function (response) {
          // Verify on backend would go here ideally 
          await submitRegistrationData(response.razorpay_payment_id);
        },
        prefill: {
          name: formData.igl.name,
          email: user?.email || '',
          contact: formData.igl.mobile,
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

    // Construct payload
    const players = [
      { ...formData.igl, role: 'IGL' },
      { ...formData.player2, role: 'Player' },
      { ...formData.player3, role: 'Player' },
      { ...formData.player4, role: 'Player' },
      { ...formData.player5, role: 'Player' },
      { ...formData.substitute, role: 'Substitute' },
    ].filter(p => p.name); // Filter out empty entries if any (though required inputs prevent this for main ones)

    const payload = {
      tournamentId: tournament._id,
      teamName: `${formData.igl.name}'s Team`, // Simplified for now
      leaderName: formData.igl.name,
      leaderContact: formData.igl.mobile,
      leaderEmail: user ? user.email : '', // Add leader email from logged in user
      players: players.map(p => ({
        name: p.name,
        uid: p.regdNo
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
        onClose();
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

  const renderPlayerSection = (key, title) => (
    <div key={key} style={{ marginBottom: '2.5rem' }}>
      <h3 className="section-title" style={{ color: themeColor }}>{title}</h3>
      <div className="inputs-grid">
        <div className="input-group">
          <input
            type="text"
            className="fancy-input"
            style={{ '--theme-color': themeColor }}
            placeholder=" "
            required
            value={formData[key].name}
            onChange={(e) => handleChange(key, 'name', e.target.value)}
          />
          <label className="input-label">Full Name *</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            className="fancy-input"
            style={{ '--theme-color': themeColor }}
            placeholder=" "
            required
            value={formData[key].college}
            onChange={(e) => handleChange(key, 'college', e.target.value)}
          />
          <label className="input-label">College Name *</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            className="fancy-input"
            style={{ '--theme-color': themeColor }}
            placeholder=" "
            required
            value={formData[key].regdNo}
            onChange={(e) => handleChange(key, 'regdNo', e.target.value)}
          />
          <label className="input-label">Registration Number *</label>
        </div>
        <div className="input-group">
          <input
            type="tel"
            className="fancy-input"
            style={{ '--theme-color': themeColor }}
            placeholder=" "
            required
            value={formData[key].mobile}
            onChange={(e) => handleChange(key, 'mobile', e.target.value)}
          />
          <label className="input-label">Mobile Number *</label>
        </div>
        <div className="input-group">
          <input
            type="tel"
            className="fancy-input"
            style={{ '--theme-color': themeColor }}
            placeholder=" "
            required
            value={formData[key].whatsapp}
            onChange={(e) => handleChange(key, 'whatsapp', e.target.value)}
          />
          <label className="input-label">WhatsApp Number *</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" style={{ '--theme-color': themeColor, '--theme-color-rgb': getComputedColor(themeColor) }}>
      <div className="form-container">
        <div className="form-header">
          <h2>Register for {tournament.name}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {renderPlayerSection('igl', 'IGL (Captain) Details')}
          {renderPlayerSection('player2', 'Player 2 Details')}
          {renderPlayerSection('player3', 'Player 3 Details')}
          {renderPlayerSection('player4', 'Player 4 Details')}
          {renderPlayerSection('player5', 'Player 5 Details')}
          {renderPlayerSection('substitute', 'Substitute Player Details')}

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
                  {formData.paymentScreenshot ? formData.paymentScreenshot.name : 'Click or drag file to upload here'}
                </span>
              </div>
            </div>
          ) : tournament?.razorpayLink ? (
            /* ── Premium Payment Card (Partner UPI Link) ── */
            <div className="payment-section">
              <h3 className="section-title" style={{ color: themeColor }}>💳 Complete Payment</h3>

              <div className="payment-card" style={{ '--theme-color': themeColor, '--theme-rgb': getComputedColor(themeColor) }}>
                {/* Glowing Amount Display */}
                <div className="payment-amount-ring">
                  <div className="payment-amount-inner">
                    <span className="payment-currency">₹</span>
                    <span className="payment-amount-value">{numericPrice}</span>
                  </div>
                </div>

                <p className="payment-instruction">Scan QR or click the button below to pay directly via UPI</p>

                {/* Payment Method Badges */}
                <div className="payment-badges">
                  <span className="payment-badge">📱 UPI</span>
                  <span className="payment-badge">💳 Cards</span>
                  <span className="payment-badge">🏦 Net Banking</span>
                  <span className="payment-badge">👛 Wallets</span>
                </div>

                {/* CTA Button */}
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

              {/* Screenshot Upload — reveals after clicking Pay */}
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
                      {formData.paymentScreenshot
                        ? `✓ ${formData.paymentScreenshot.name}`
                        : 'Click or drag your payment screenshot here'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Razorpay SDK Flow (no partner link set) ── */
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
              style={{ background: themeColor }}
            >
              {isSubmitting ? 'Processing...' : (
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

// Helper function to extract roughly RGB from hex/rgb strings for the CSS variables glow effect 
// We are faking it generically if it's a hex
function getComputedColor(color) {
  if (color === '#ff4655') return '255, 70, 85';
  if (color === '#f97316') return '249, 115, 22';
  if (color === '#ec4899') return '236, 72, 153';
  return '255, 255, 255';
}

export default TournamentRegistrationForm;
