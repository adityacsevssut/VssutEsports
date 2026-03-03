const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin'], 
    default: 'admin' 
  },
  // If role is admin, they can manage these games. 'all' is for superadmin.
  allowedGames: [{
    type: String,
    enum: ['freefire', 'bgmi', 'valorant', 'all'],
    default: 'all'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
