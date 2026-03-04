const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');

// Helper to check permissions (Duplicated for now, or move to a shared util)
const canManage = (user, game) => {
    const gameKey = game.toLowerCase();
    return user.role === 'superadmin' || 
           user.allowedGames.includes('all') || 
           user.allowedGames.includes(gameKey);
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
        leaderEmail: req.body.leaderEmail, // Add logic to capturing email
        players
    });

    res.status(201).json(registration);
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

    if (!canManage(req.user, tournament.game)) {
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
    if (!canManage(req.user, tournament.game)) {
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

    const registrations = await Registration.find({
        $or: [
            { leaderEmail: req.user.email },
            { 'players.email': req.user.email }
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
