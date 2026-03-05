/**
 * Database Clearing Script — VSSUT Esports
 * Usage: node src/scripts/clearDatabase.js
 *
 * Clears:  Registrations, Players
 * Keeps:   Tournaments, Partners/Admins (so platform still works)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const Registration = require('../models/Registration');
const Player = require('../models/Player');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // --- Clear Registrations ---
    const regResult = await Registration.deleteMany({});
    console.log(`🗑️  Registrations deleted: ${regResult.deletedCount}`);

    // --- Clear Players ---
    const playerResult = await Player.deleteMany({});
    console.log(`🗑️  Players deleted:       ${playerResult.deletedCount}`);

    console.log('\n✅ Database cleared for fresh start!');
    console.log('   Tournaments and Admin/Partner accounts are preserved.\n');
  } catch (err) {
    console.error('❌ Error clearing database:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
})();
