import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PartnerForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organisingId: '',
    role: 'partner_freefire',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.organisingId || !formData.password || !formData.role) {
      toast.error("Please fill all required fields.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="glass-panel form-container">
      <h3>Add New Partner</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label>Partner Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe / Tech Club"
              required
            />
          </div>
          <div className="form-group">
            <label>Partner Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="partner@example.com"
              required
            />
          </div>
        </div>

        {/* Grid for password/org id */}
        <div className="grid-2">
          <div className="form-group">
            <label>Password (for Login)</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Secret Password"
              required
            />
          </div>
          <div className="form-group">
            <label>Organising ID (Secret Token)</label>
            <input
              type="text"
              name="organisingId"
              value={formData.organisingId}
              onChange={handleChange}
              placeholder="e.g. FF-2024-ORG"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Game Allocation (Role)</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="partner_freefire">Free Fire</option>
            <option value="partner_bgmi">BGMI</option>
            <option value="partner_valorant">Valorant</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
          <button type="submit" className="btn-submit">Create Partner</button>
        </div>
      </form>
    </div>
  );
};

export default PartnerForm;
