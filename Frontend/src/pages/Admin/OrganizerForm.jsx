import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const OrganizerForm = ({ game, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#8b5cf6',
    members: []
  });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, e) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, members: updatedMembers });
  };


  const handleMemberCountChange = (e) => {
    const count = parseInt(e.target.value);
    const currentMembers = [...formData.members];

    // Resize array
    if (count > currentMembers.length) {
      // Add empty members
      for (let i = currentMembers.length; i < count; i++) {
        currentMembers.push({
          id: Date.now() + i,
          name: '',
          role: '',
          mobile: '',
          branch: '',
          college: '',
          year: ''
        });
      }
    } else {
      // Remove members from the end
      currentMembers.length = count;
    }

    setFormData({ ...formData, members: currentMembers });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Organizer Name is required.");
      return;
    }
    if (formData.members.some(m => !m.name || !m.role)) {
      toast.error("All members must have a name and role.");
      return;
    }
    onSubmit({ ...formData, game });
  };

  return (
    <div className="glass-panel form-container">
      <h3>Add New {game} Organizer Team</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label>Team Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Slug (Unique ID)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. nexus" required />
          </div>
        </div>

        <div className="form-group">
          <label>Theme Color</label>
          <input type="color" name="color" value={formData.color} onChange={handleChange} className="color-picker" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required placeholder="Brief description of the organizer team" />
        </div>

        <div className="form-group">
          <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ margin: 0 }}>Team Members</label>
            <select
              value={formData.members.length}
              onChange={handleMemberCountChange}
              style={{ width: 'auto', padding: '0.4rem 1rem' }}
            >
              <option value="0">Select Count</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} Member{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="members-grid-container">
            {formData.members.map((member, index) => (
              <div key={member.id} className="member-card">
                <div className="member-card-header">
                  <span>Member {index + 1}</span>
                </div>
                <div className="grid-3">
                  <input type="text" name="name" value={member.name} onChange={(e) => handleMemberChange(index, e)} placeholder="Name *" required />
                  <input type="text" name="role" value={member.role} onChange={(e) => handleMemberChange(index, e)} placeholder="Role *" required />
                  <input type="tel" name="mobile" value={member.mobile} onChange={(e) => handleMemberChange(index, e)} placeholder="Mobile *" required />
                </div>
                <div className="grid-3" style={{ marginTop: '0.5rem' }}>
                  <input type="text" name="branch" value={member.branch} onChange={(e) => handleMemberChange(index, e)} placeholder="Branch *" required />
                  <input type="text" name="college" value={member.college} onChange={(e) => handleMemberChange(index, e)} placeholder="College *" required />
                  <input type="text" name="year" value={member.year} onChange={(e) => handleMemberChange(index, e)} placeholder="Year *" required />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
          <button type="submit" className="btn-submit">Create Team</button>
        </div>
      </form >
    </div >
  );
};

export default OrganizerForm;
