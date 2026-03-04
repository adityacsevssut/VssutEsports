import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import '../../components/TournamentRegistrationForm.css';
import BASE_URL from '../../config/api';

const TournamentForm = ({ game, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    slug: '',
    date: '',
    time: '',
    prize: '',
    format: '',
    playerFormat: '',
    customIglCount: 1,
    customPlayerCount: 3,
    customSubstituteCount: 1,
    pricePerTeam: '',
    qrCodeUrl: '',
    slots: '',
    status: 'Upcoming',
    description: '',
    organisingTeam: '',
    includeOrganizer: false,
    organizer: {
      description: '',
      color: '#8b5cf6',
      members: []
    },
    registrationClosesAt: '',
    rulePdf: '',
    rules: [],
    posterUrl: '',
    guidelinesUrl: '',
    fixturesUrl: '',
    pointTableUrl: '',
    googleSheetUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [guidelinesUploading, setGuidelinesUploading] = useState(false);
  const [fixturesUploading, setFixturesUploading] = useState(false);
  const [pointTableUploading, setPointTableUploading] = useState(false);
  const [numRules, setNumRules] = useState(initialData?.rules?.length || 0);
  const [uploadError, setUploadError] = useState('');
  const [guidelinesUploadError, setGuidelinesUploadError] = useState('');
  const [fixturesUploadError, setFixturesUploadError] = useState('');
  const [pointTableUploadError, setPointTableUploadError] = useState('');
  const [qrCodeUploading, setQrCodeUploading] = useState(false);
  const [qrCodeUploadError, setQrCodeUploadError] = useState('');
  const posterUrlRef = useRef(initialData?.posterUrl || '');
  const guidelinesUrlRef = useRef(initialData?.guidelinesUrl || '');
  const fixturesUrlRef = useRef(initialData?.fixturesUrl || '');
  const pointTableUrlRef = useRef(initialData?.pointTableUrl || '');
  const qrCodeUrlRef = useRef(initialData?.qrCodeUrl || '');

  // theme color setup
  const getThemeColor = (gameName) => {
    switch (gameName) {
      case 'valorant': return '#ff4655';
      case 'bgmi': return '#f97316';
      case 'freefire': return '#ec4899';
      default: return '#8b5cf6';
    }
  };

  function getComputedColor(color) {
    if (color === '#ff4655') return '255, 70, 85';
    if (color === '#f97316') return '249, 115, 22';
    if (color === '#ec4899') return '236, 72, 153';
    return '139, 92, 246';
  }

  const themeColor = getThemeColor(game);
  const themeRgb = getComputedColor(themeColor);

  useEffect(() => {
    if (initialData) {
      const formattedData = { ...initialData };
      if (formattedData.registrationClosesAt) {
        const d = new Date(formattedData.registrationClosesAt);
        if (!isNaN(d)) {
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          formattedData.registrationClosesAt = d.toISOString().slice(0, 16);
        }
      }
      setFormData(formattedData);
      setNumRules(formattedData.rules?.length || 0);
      // Seed refs on mount so existing URLs are preserved if user saves without re-uploading
      posterUrlRef.current = formattedData.posterUrl || '';
      guidelinesUrlRef.current = formattedData.guidelinesUrl || '';
      fixturesUrlRef.current = formattedData.fixturesUrl || '';
      pointTableUrlRef.current = formattedData.pointTableUrl || '';
      qrCodeUrlRef.current = formattedData.qrCodeUrl || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount — prevents resetting after uploads

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumRulesChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setNumRules(val);
    const newRules = [...(formData.rules || [])];
    if (val > newRules.length) {
      newRules.push(...Array(val - newRules.length).fill(''));
    } else {
      newRules.splice(val);
    }
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const handleRuleChange = (index, value) => {
    setFormData(prev => {
      const newRules = [...(prev.rules || [])];
      newRules[index] = value;
      return { ...prev, rules: newRules };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      // Dynamic import to avoid loading supabase if not needed immediately
      const { supabase, supabaseUrl } = await import('../../services/supabaseClient.js');

      if (supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase is not configured! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Frontend .env file.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      // Assuming 'tournaments' bucket is created in Supabase
      const { data, error } = await supabase.storage
        .from('tournaments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath);

      posterUrlRef.current = publicUrl;
      setFormData(prev => ({ ...prev, posterUrl: publicUrl }));

      // If editing an existing tournament, immediately save to DB so the URL
      // persists even if React state resets before the form is saved
      if (initialData?._id) {
        await fetch(`' + API + '/tournaments/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posterUrl: publicUrl })
        });
      }
    } catch (err) {
      console.error('Error uploading to Supabase:', err);
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleGuidelinesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGuidelinesUploading(true);
    setGuidelinesUploadError('');

    try {
      const { supabase, supabaseUrl } = await import('../../services/supabaseClient.js');

      if (supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase is not configured! Please add credentials to your .env file.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `guidelines/${fileName}`;

      const { error } = await supabase.storage
        .from('tournaments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath);

      guidelinesUrlRef.current = publicUrl;
      setFormData(prev => ({ ...prev, guidelinesUrl: publicUrl }));

      // Immediately save to DB if editing an existing tournament
      if (initialData?._id) {
        await fetch(`' + API + '/tournaments/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guidelinesUrl: publicUrl })
        });
      }
    } catch (err) {
      console.error('Error uploading guidelines:', err);
      setGuidelinesUploadError(err.message || 'Error uploading file');
    } finally {
      setGuidelinesUploading(false);
    }
  };

  // ── Fixtures upload ────────────────────────────────────────────
  const handleFixturesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFixturesUploading(true);
    setFixturesUploadError('');
    try {
      const { supabase, supabaseUrl } = await import('../../services/supabaseClient.js');
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase is not configured! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Frontend .env file.');
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `guidelines/fixtures_${fileName}`;

      const { data, error } = await supabase.storage.from('tournaments').upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(filePath);

      fixturesUrlRef.current = publicUrl;
      setFormData(prev => ({ ...prev, fixturesUrl: publicUrl }));

      // Immediately save to DB if editing an existing tournament
      if (initialData?._id) {
        await fetch(`' + API + '/tournaments/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fixturesUrl: publicUrl })
        });
      }
    } catch (err) {
      console.error('Error uploading fixtures:', err);
      setFixturesUploadError(err.message || 'Error uploading file');
    } finally {
      setFixturesUploading(false);
    }
  };

  // ── Point Table upload ─────────────────────────────────────────────
  const handlePointTableUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPointTableUploading(true);
    setPointTableUploadError('');
    try {
      const { supabase, supabaseUrl } = await import('../../services/supabaseClient.js');
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase is not configured! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Frontend .env file.');
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `guidelines/pointtable_${fileName}`;

      const { data, error } = await supabase.storage.from('tournaments').upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(filePath);

      pointTableUrlRef.current = publicUrl;
      setFormData(prev => ({ ...prev, pointTableUrl: publicUrl }));

      // Immediately save to DB if editing an existing tournament
      if (initialData?._id) {
        await fetch(`${BASE_URL}/tournaments/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pointTableUrl: publicUrl })
        });
      }
    } catch (err) {
      console.error('Error uploading point table:', err);
      setPointTableUploadError(err.message || 'Error uploading file');
    } finally {
      setPointTableUploading(false);
    }
  };

  // ── QR Code Upload ──────────────────────────────────────────────
  const handleQrCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setQrCodeUploading(true);
    setQrCodeUploadError('');

    try {
      const { supabase, supabaseUrl } = await import('../../services/supabaseClient.js');

      if (supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase is not configured! Please add credentials to your .env file.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posters/${fileName}`; // Save in same bucket

      const { error } = await supabase.storage
        .from('tournaments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath);

      qrCodeUrlRef.current = publicUrl;
      setFormData(prev => ({ ...prev, qrCodeUrl: publicUrl }));

      // Immediately save to DB if editing an existing tournament
      if (initialData?._id) {
        await fetch(`${BASE_URL}/tournaments/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeUrl: publicUrl })
        });
      }
    } catch (err) {
      console.error('Error uploading QR Code:', err);
      setQrCodeUploadError(err.message || 'Error uploading file');
    } finally {
      setQrCodeUploading(false);
    }
  };

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      organizer: { ...prev.organizer, [name]: value }
    }));
  };

  const handleOrgMemberCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setFormData(prev => {
      const currentMembers = [...(prev.organizer.members || [])];
      if (count > currentMembers.length) {
        for (let i = currentMembers.length; i < count; i++) {
          currentMembers.push({ id: Date.now() + i, name: '', role: '', mobile: '', branch: '', college: '', year: '' });
        }
      } else {
        currentMembers.length = count;
      }
      return { ...prev, organizer: { ...prev.organizer, members: currentMembers } };
    });
  };

  const handleOrgMemberChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedMembers = [...prev.organizer.members];
      updatedMembers[index] = { ...updatedMembers[index], [name]: value };
      return { ...prev, organizer: { ...prev.organizer, members: updatedMembers } };
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.date || !formData.prize || !formData.status) {
      toast.error("Please fill the required fields (Name, Date, Prize, Status)");
      return;
    }
    if (formData.includeOrganizer && !formData.organisingTeam) {
      toast.error("Please provide the Organising Team Name to generate an Organizer.");
      return;
    }

    const payload = {
      ...formData,
      posterUrl: posterUrlRef.current || formData.posterUrl,
      guidelinesUrl: guidelinesUrlRef.current || formData.guidelinesUrl,
      fixturesUrl: fixturesUrlRef.current || formData.fixturesUrl,
      pointTableUrl: pointTableUrlRef.current || formData.pointTableUrl,
      qrCodeUrl: qrCodeUrlRef.current || formData.qrCodeUrl,
      googleSheetUrl: formData.googleSheetUrl,
      id: formData.slug || formData.id,
      game
    };
    onSubmit(payload);
  };

  return (
    <div className="glass-panel tournament-form-wrap">
      <h3 className="section-title" style={{ color: themeColor, marginBottom: '2rem' }}>
        {initialData ? 'Edit' : 'Add New'} {game} Tournament
      </h3>

      <form onSubmit={handleSubmit} className="registration-form" style={{ padding: 0 }}>
        <div className="inputs-grid" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
          <div className="input-group">
            <input type="text" name="name" className="fancy-input" placeholder=" " value={formData.name} onChange={handleChange} required />
            <label className="input-label">Tournament Name</label>
          </div>
          <div className="input-group">
            <input type="text" name="slug" className="fancy-input" placeholder=" " value={formData.slug || formData.id || ''} onChange={handleChange} required disabled={!!initialData} />
            <label className="input-label">Slug (Unique ID)</label>
          </div>
          <div className="input-group">
            <input type="text" name="organisingTeam" className="fancy-input" placeholder=" " value={formData.organisingTeam} onChange={handleChange} required />
            <label className="input-label">Organizing Team Name</label>
          </div>
          <div className="input-group">
            <input type="text" name="date" className="fancy-input" placeholder=" " value={formData.date} onChange={handleChange} required />
            <label className="input-label">Date (e.g. April 10, 2025)</label>
          </div>
          <div className="input-group">
            <input type="text" name="prize" className="fancy-input" placeholder=" " value={formData.prize} onChange={handleChange} />
            <label className="input-label">Prize Pool</label>
          </div>
          <div className="input-group">
            <input type="text" name="format" className="fancy-input" placeholder=" " value={formData.format} onChange={handleChange} />
            <label className="input-label">Format (e.g. Squad)</label>
          </div>
          <div className="input-group">
            <input type="text" name="slots" className="fancy-input" placeholder=" " value={formData.slots} onChange={handleChange} />
            <label className="input-label">Slots</label>
          </div>
          <div className="input-group">
            <select name="playerFormat" className="fancy-input" style={{ appearance: 'none' }} value={formData.playerFormat || ''} onChange={handleChange}>
              <option value="">Select Format</option>
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
              <option value="Custom">Custom</option>
            </select>
            <label className="input-label" style={{ top: '-6px', transform: 'translateY(-100%)', left: '0.2rem', fontSize: '0.85rem', color: themeColor, fontWeight: 600 }}>Player Format</label>
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
          </div>

          {formData.playerFormat === 'Custom' && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div className="input-group">
                <input type="number" min="0" name="customIglCount" className="fancy-input" placeholder=" " value={formData.customIglCount} onChange={handleChange} required />
                <label className="input-label">Active IGL Count</label>
              </div>
              <div className="input-group">
                <input type="number" min="0" name="customPlayerCount" className="fancy-input" placeholder=" " value={formData.customPlayerCount} onChange={handleChange} required />
                <label className="input-label">Active Player Count</label>
              </div>
              <div className="input-group">
                <input type="number" min="0" name="customSubstituteCount" className="fancy-input" placeholder=" " value={formData.customSubstituteCount} onChange={handleChange} required />
                <label className="input-label">Substitute Count</label>
              </div>
            </div>
          )}
          <div className="input-group">
            <input type="text" name="pricePerTeam" className="fancy-input" placeholder=" " value={formData.pricePerTeam} onChange={handleChange} />
            <label className="input-label">Price Per Team</label>
          </div>
          {formData.pricePerTeam && formData.pricePerTeam.toLowerCase() !== 'free' && (
            <div className="input-group" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${themeColor}40` }}>
              <label style={{ display: 'block', marginBottom: '1rem', color: themeColor, fontWeight: 600 }}>Payment QR Code (UPI)</label>
              <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb, background: 'rgba(255,255,255,0.03)' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeUpload}
                  className="file-input"
                  disabled={qrCodeUploading}
                />
                <div className="upload-icon">
                  {qrCodeUploading ? '⏳' : (formData.qrCodeUrl ? '✓' : '📷')}
                </div>
                <span className="upload-text">
                  {qrCodeUploading ? 'Uploading QR Code...' : (formData.qrCodeUrl ? 'QR Code Uploaded! Click to replace' : 'Upload QR Code image designed by organizer')}
                </span>
              </div>
              {qrCodeUploadError && <div style={{ color: '#ff4655', marginTop: '0.5rem', fontSize: '0.85rem' }}>{qrCodeUploadError}</div>}
              {formData.qrCodeUrl && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={formData.qrCodeUrl} alt="QR Code Output" style={{ maxWidth: '100px', borderRadius: '8px', objectFit: 'contain', background: '#fff', padding: '4px', border: `2px solid ${themeColor}` }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Players registering will be shown this QR Code to scan and pay.</p>
                </div>
              )}
            </div>
          )}

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', zIndex: 1 }}>📊</span>
              <input
                type="url"
                name="googleSheetUrl"
                className="fancy-input"
                placeholder=" "
                value={formData.googleSheetUrl || ''}
                onChange={handleChange}
                style={{ paddingLeft: '2.8rem' }}
              />
              <label className="input-label" style={{ left: '2.8rem' }}>Google Apps Script Web App URL (Optional)</label>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automatically append new registrations to your Google Sheet. <a href="https://developers.google.com/apps-script/guides/web" target="_blank" rel="noopener noreferrer" style={{ color: themeColor, textDecoration: 'underline' }}>Learn how to create a Web App URL</a>.
            </p>
          </div>

          <div className="input-group">
            <select name="status" className="fancy-input" style={{ appearance: 'none' }} value={formData.status} onChange={handleChange}>
              <option>Upcoming</option>
              <option>Registration Open</option>
              <option>Registration Closed</option>
            </select>
            <label className="input-label" style={{ top: '-6px', transform: 'translateY(-100%)', left: '0.2rem', fontSize: '0.85rem', color: themeColor, fontWeight: 600 }}>Status</label>
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
          </div>

          {formData.status === 'Registration Open' && (
            <div className="input-group">
              <input type="datetime-local" name="registrationClosesAt" className="fancy-input" value={formData.registrationClosesAt || ''} onChange={(e) => setFormData({ ...formData, registrationClosesAt: e.target.value })} required />
              <label className="input-label" style={{ top: '-6px', transform: 'translateY(-100%)', left: '0.2rem', fontSize: '0.85rem', color: themeColor, fontWeight: 600 }}>Registration Closes At</label>
            </div>
          )}
        </div>

        <div className="input-group" style={{ marginBottom: '2.5rem', '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
          <textarea name="description" className="fancy-input" placeholder=" " value={formData.description} onChange={handleChange} rows="3" style={{ paddingTop: '1.2rem' }}></textarea>
          <label className="input-label" style={!formData.description ? { top: '1.5rem', transform: 'translateY(-50%)' } : {}}>Description</label>
        </div>

        <div className="payment-section" style={{ borderTop: 'none', paddingTop: 0, marginBottom: '2.5rem' }}>
          <h3 className="section-title" style={{ color: themeColor }}>Tournament Poster Upload</h3>
          <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            <input
              type="file"
              accept="image/*,video/*,application/pdf"
              onChange={handleFileUpload}
              className="file-input"
              disabled={uploading}
            />
            <div className="upload-icon">
              {uploading ? '⏳' : (formData.posterUrl ? '✓' : '⇧')}
            </div>
            <span className="upload-text">
              {uploading ? 'Uploading...' : (formData.posterUrl ? 'File Uploaded! Click to replace' : 'Click or drag file to upload here')}
            </span>
          </div>
          {uploadError && <div style={{ color: '#ff4655', marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{uploadError}</div>}
          {formData.posterUrl && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Current Poster Preview:</p>
              {formData.posterUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={formData.posterUrl} controls style={{ maxWidth: '300px', borderRadius: '12px', border: `2px solid ${themeColor}` }}></video>
              ) : formData.posterUrl.match(/\.(pdf)$/i) ? (
                <a href={formData.posterUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: `1px solid ${themeColor}`, color: themeColor, textDecoration: 'none', fontWeight: 'bold' }}>
                  📄 View Uploaded PDF Document
                </a>
              ) : (
                <img src={formData.posterUrl} alt="Poster Output" style={{ maxWidth: '300px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${themeColor}` }} />
              )}
            </div>
          )}
        </div>

        {/* ── Guidelines Upload ── */}
        <div className="payment-section" style={{ paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
          <h3 className="section-title" style={{ color: themeColor }}>📋 Tournament Guidelines</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Upload a PDF or image (rulebook, schedule, brackets) — players can download it from the tournament page.</p>
          <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleGuidelinesUpload}
              className="file-input"
              disabled={guidelinesUploading}
            />
            <div className="upload-icon">
              {guidelinesUploading ? '⏳' : (formData.guidelinesUrl ? '✓' : '📋')}
            </div>
            <span className="upload-text">
              {guidelinesUploading ? 'Uploading...' : (formData.guidelinesUrl ? 'Guidelines Uploaded! Click to replace' : 'Upload Guidelines PDF or Image')}
            </span>
          </div>
          {guidelinesUploadError && <div style={{ color: '#ff4655', marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{guidelinesUploadError}</div>}
          {formData.guidelinesUrl && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: `1px solid ${themeColor}40` }}>
              <span style={{ fontSize: '1.5rem' }}>{formData.guidelinesUrl.match(/\.pdf$/i) ? '📄' : '🖼️'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Guidelines file ready</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Players can download this from the tournament page</p>
              </div>
              <a href={formData.guidelinesUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: themeColor, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${themeColor}`, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                Preview
              </a>
            </div>
          )}
        </div>

        {/* ── Fixtures Upload ── */}
        <div className="payment-section" style={{ paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
          <h3 className="section-title" style={{ color: themeColor }}>🗓️ Tournament Fixtures</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Upload the fixtures/schedule — players can download it from the tournament page.</p>
          <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            <input type="file" accept="image/*,application/pdf" onChange={handleFixturesUpload} className="file-input" disabled={fixturesUploading} />
            <div className="upload-icon">{fixturesUploading ? '⏳' : (formData.fixturesUrl ? '✓' : '🗓️')}</div>
            <span className="upload-text">{fixturesUploading ? 'Uploading...' : (formData.fixturesUrl ? 'Fixtures Uploaded! Click to replace' : 'Upload Fixtures PDF or Image')}</span>
          </div>
          {fixturesUploadError && <div style={{ color: '#ff4655', marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{fixturesUploadError}</div>}
          {formData.fixturesUrl && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: `1px solid ${themeColor}40` }}>
              <span style={{ fontSize: '1.5rem' }}>{formData.fixturesUrl.match(/\.pdf$/i) ? '📄' : '🖼️'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Fixtures file ready</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Players can download this from the tournament page</p>
              </div>
              <a href={formData.fixturesUrl} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${themeColor}`, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>Preview</a>
            </div>
          )}
        </div>

        {/* ── Point Table Upload ── */}
        <div className="payment-section" style={{ paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
          <h3 className="section-title" style={{ color: themeColor }}>🏆 Point Table</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Upload the current point table — players can view it from the tournament page.</p>
          <div className="file-upload-wrapper" style={{ '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            <input type="file" accept="image/*,application/pdf" onChange={handlePointTableUpload} className="file-input" disabled={pointTableUploading} />
            <div className="upload-icon">{pointTableUploading ? '⏳' : (formData.pointTableUrl ? '✓' : '🏆')}</div>
            <span className="upload-text">{pointTableUploading ? 'Uploading...' : (formData.pointTableUrl ? 'Point Table Uploaded! Click to replace' : 'Upload Point Table PDF or Image')}</span>
          </div>
          {pointTableUploadError && <div style={{ color: '#ff4655', marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{pointTableUploadError}</div>}
          {formData.pointTableUrl && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: `1px solid ${themeColor}40` }}>
              <span style={{ fontSize: '1.5rem' }}>{formData.pointTableUrl.match(/\.pdf$/i) ? '📄' : '🖼️'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Point Table file ready</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Players can view this from the tournament page</p>
              </div>
              <a href={formData.pointTableUrl} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${themeColor}`, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>Preview</a>
            </div>
          )}
        </div>

        <div className="payment-section" style={{ paddingTop: '2.5rem' }}>
          <h3 className="section-title" style={{ color: themeColor }}>Rules & Regulations</h3>
          <div className="input-group" style={{ marginBottom: '2rem', '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            <input
              type="number"
              min="0"
              className="fancy-input"
              value={numRules}
              onChange={handleNumRulesChange}
              placeholder=" "
            />
            <label className="input-label">Number of Rules</label>
          </div>

          <div className="rules-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
            {formData.rules && formData.rules.map((rule, idx) => (
              <div key={idx} className="input-group">
                <input
                  type="text"
                  className="fancy-input"
                  value={rule}
                  onChange={(e) => handleRuleChange(idx, e.target.value)}
                  placeholder=" "
                  required
                />
                <label className="input-label">Rule {idx + 1}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-section" style={{ paddingTop: '2.5rem', '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, cursor: 'pointer', marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>
            <input
              type="checkbox"
              checked={formData.includeOrganizer}
              onChange={(e) => setFormData({ ...formData, includeOrganizer: e.target.checked })}
              style={{ width: '22px', height: '22px', accentColor: themeColor, cursor: 'pointer' }}
            />
            <span>Include / Define Organizer Details</span>
          </label>

          {formData.includeOrganizer && (
            <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px solid ${themeColor}40` }}>
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <textarea name="description" className="fancy-input" placeholder=" " value={formData.organizer.description} onChange={handleOrgChange} rows="2" style={{ paddingTop: '1.2rem' }}></textarea>
                <label className="input-label" style={!formData.organizer.description ? { top: '1.5rem', transform: 'translateY(-50%)' } : {}}>Team Description</label>
              </div>
              <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                <input type="color" name="color" value={formData.organizer.color} onChange={handleOrgChange} className="fancy-input" style={{ padding: '0.2rem 1rem', height: '55px', cursor: 'pointer' }} />
                <label className="input-label" style={{ top: '-6px', transform: 'translateY(-100%)', left: '0.2rem', fontSize: '0.85rem', color: themeColor, fontWeight: 600 }}>Theme Color</label>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="section-title" style={{ color: themeColor, margin: 0, border: 'none' }}>Team Members</h3>
                  <div className="input-group" style={{ width: '200px' }}>
                    <select
                      value={formData.organizer.members?.length || 0}
                      onChange={handleOrgMemberCountChange}
                      className="fancy-input"
                      style={{ appearance: 'none' }}
                    >
                      <option value="0">Select Count</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} Member{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <label className="input-label" style={{ top: '-6px', transform: 'translateY(-100%)', left: '0.2rem', fontSize: '0.85rem', color: themeColor, fontWeight: 600 }}>Members Count</label>
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
                  </div>
                </div>

                <div className="members-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {formData.organizer.members && formData.organizer.members.map((member, index) => (
                    <div key={member.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', border: `1px solid ${themeColor}20` }}>
                      <div className="section-title" style={{ marginBottom: '1.5rem', color: 'white', fontSize: '1.1rem' }}>
                        Member {index + 1}
                      </div>
                      <div className="inputs-grid" style={{ marginBottom: 0 }}>
                        <div className="input-group">
                          <input type="text" name="name" className="fancy-input" value={member.name} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " required />
                          <label className="input-label">Name</label>
                        </div>
                        <div className="input-group">
                          <input type="text" name="role" className="fancy-input" value={member.role} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " required />
                          <label className="input-label">Role</label>
                        </div>
                        <div className="input-group">
                          <input type="tel" name="mobile" className="fancy-input" value={member.mobile} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " />
                          <label className="input-label">Mobile</label>
                        </div>
                        <div className="input-group">
                          <input type="text" name="branch" className="fancy-input" value={member.branch} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " />
                          <label className="input-label">Branch</label>
                        </div>
                        <div className="input-group">
                          <input type="text" name="college" className="fancy-input" value={member.college} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " />
                          <label className="input-label">College</label>
                        </div>
                        <div className="input-group">
                          <input type="text" name="year" className="fancy-input" value={member.year} onChange={(e) => handleOrgMemberChange(index, e)} placeholder=" " />
                          <label className="input-label">Year</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions" style={{ marginTop: '2rem', '--theme-color': themeColor, '--theme-color-rgb': themeRgb }}>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
          <button type="submit" className="submit-btn" style={{ background: themeColor, borderColor: themeColor }}>
            {initialData ? 'Update Tournament' : 'Create Tournament'}
          </button>
        </div>
      </form >
    </div >
  );
};

export default TournamentForm;
