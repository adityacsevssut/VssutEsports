const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  mobile: { type: String },
  branch: { type: String },
  college: { type: String },
  year: { type: String }
});

const organizerSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g., 'nexus'
  game: { 
    type: String, 
    required: true,
    enum: ['freefire', 'bgmi', 'valorant']
  },
  name: { type: String, required: true }, // e.g., 'Team Nexus'
  description: { type: String },
  color: { type: String }, // Hex code
  members: [memberSchema]
}, { timestamps: true });

module.exports = mongoose.model('Organizer', organizerSchema);
