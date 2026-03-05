const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Helper to check permissions (Duplicated for now, or move to a shared util)
const canManage = (user, game, tournament) => {
    const gameKey = game.toLowerCase();
    if (user.role === 'superadmin' || user.role === 'developer') return true;
    if (user.allowedGames && (user.allowedGames.includes('all') || user.allowedGames.includes(gameKey))) return true;
    
    if (user.role === `partner_${gameKey}`) {
        // Allow if user is the creator (or if for some reason createdBy is not set on older docs, allow by default to avoid breaking)
        if (!tournament || !tournament.createdBy || tournament.createdBy === String(user._id || user.id)) {
            return true;
        }
    }
    return false;
};

// @desc    Register a team for a tournament
// @route   POST /api/registrations
// @access  Public
const registerTeam = async (req, res) => {
  try {
    const { tournamentId, teamName, leaderName, leaderContact, players } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const registration = await Registration.create({
        tournamentId,
        teamName,
        leaderName,
        leaderContact,
        leaderEmail: req.body.leaderEmail, 
        players,
        paymentScreenshot: req.body.paymentScreenshot,
        utrNumber: req.body.utrNumber
    });

    res.status(201).json(registration);

    // After responding to user, try to sync with Google Sheets asynchronously
    if (tournament.googleSheetUrl) {
      try {
        const igl = (players && players.length > 0) ? players[0] : {};
        const payload = {
          tournamentName: tournament.name,
          game: tournament.game,
          teamName: teamName || '-',
          leaderName: leaderName || '-',
          leaderContact: leaderContact || '-',
          leaderWhatsapp: igl.whatsapp || '-',
          leaderEmail: req.body.leaderEmail || '-',
          leaderUid: igl.uid || '-',
          paymentScreenshot: req.body.paymentScreenshot || '-',
          utrNumber: req.body.utrNumber || '-',
          players: players || []
        };
        
        // We do this via fetch asynchronously without await so it doesn't block the API response
        fetch(tournament.googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text();
            console.error('Google Sheet Error Response:', text);
          } else {
            console.log('Successfully synced with Google Sheet');
          }
        })
        .catch(err => console.error('Failed to sync with Google Sheet:', err.message));
        
      } catch (err) {
        console.error('Error formatting Google Sheets payload:', err);
      }
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get registrations for a tournament
// @route   GET /api/registrations/tournament/:tournamentId
// @access  Private (Admin)
const getRegistrations = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!canManage(req.user, tournament.game, tournament)) {
        return res.status(403).json({ message: 'Not authorized to view these registrations' });
    }

    const registrations = await Registration.find({ tournamentId: req.params.tournamentId });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update registration status
// @route   PUT /api/registrations/:id
// @access  Private (Admin)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findById(req.params.id).populate('tournamentId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const tournament = registration.tournamentId; // Populated
    if (!canManage(req.user, tournament.game, tournament)) {
        return res.status(403).json({ message: 'Not authorized to manage this registration' });
    }

    registration.status = status;
    await registration.save();

    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get registrations for logged in user (Player)
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    // If user is a player, we look for registrations where leaderEmail matches their email
    // Or if we extended Registration to have userId, we would use that.
    // For now, based on email.
    if (!req.user || !req.user.email) {
        return res.status(400).json({ message: 'User email not found' });
    }

    const userEmailRegex = new RegExp(`^${req.user.email}$`, 'i');

    const registrations = await Registration.find({
        $or: [
            { leaderEmail: userEmailRegex },
            { 'players.email': userEmailRegex }
        ]
    })
        .populate('tournamentId', 'name game status date slug posterUrl prize format slots')
        .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerTeam,
  getRegistrations,
  updateRegistrationStatus,
  getMyRegistrations
};
