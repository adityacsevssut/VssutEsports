const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true }, // This will map to 'id' in frontend (e.g. 'ff-freshers-2025')
  game: { 
    type: String, 
    required: true, 
    enum: ['freefire', 'bgmi', 'valorant'] 
  },
  name: { type: String, required: true },
  organisingTeam: { type: String, default: "VSSUT Esports" },
  date: { type: String, required: true }, // Storing as string to match frontend format for now
  status: { 
    type: String, 
    default: 'Upcoming',
    enum: ['Upcoming', 'Registration Open', 'Registration Closed', 'Live', 'Completed'] 
  },
  prize: { type: String, default: "TBA" },
  format: { type: String, default: "TBA" },
  playerFormat: { type: String, default: "TBA" },
  customIglCount: { type: Number, default: 1 },
  customPlayerCount: { type: Number, default: 3 },
  customSubstituteCount: { type: Number, default: 1 },
  pricePerTeam: { type: String, default: "Free" },
  slots: { type: String, default: "Limited" },
  description: { type: String },
  rules: [{ type: String }],
  posterUrl: { type: String },
  guidelinesUrl: { type: String },
  guidelinesEnabled: { type: Boolean, default: false },
  fixturesUrl: { type: String },
  pointTableUrl: { type: String },
  registrationClosesAt: { type: Date },
  razorpayLink: { type: String, default: '' },
  googleSheetUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
