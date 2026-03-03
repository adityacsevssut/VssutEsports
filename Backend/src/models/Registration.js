const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  teamName: { type: String, required: true },
  leaderName: { type: String, required: true },
  leaderContact: { type: String, required: true },
  leaderEmail: { type: String },
  players: [{
    name: { type: String },
    uid: { type: String } // In-game ID
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  paymentScreenshot: { type: String } // URL if needed
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
