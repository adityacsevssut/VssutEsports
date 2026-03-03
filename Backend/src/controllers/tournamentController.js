const Tournament = require('../models/Tournament');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const { game } = req.query;
    let query = {};
    if (game) {
      query.game = game; // Filter by game if provided
    }
    const tournaments = await Tournament.find(query).sort({ createdAt: -1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id or :slug
// @access  Public
const getTournament = async (req, res) => {
  try {
    let tournament;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        tournament = await Tournament.findById(req.params.id);
    } 
    if (!tournament) {
        tournament = await Tournament.findOne({ slug: req.params.id });
    }

    if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Public (No Auth)
const createTournament = async (req, res) => {
  try {
    // Removed Auth Check
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Public (No Auth)
const updateTournament = async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
    if(!tournament) { 
         tournament = await Tournament.findOne({ slug: req.params.id });
    }

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Removed Auth Check

    const updatedTournament = await Tournament.findByIdAndUpdate(tournament._id, req.body, {
      new: true,
    });

    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Public (No Auth)
const deleteTournament = async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
     if(!tournament) { 
         tournament = await Tournament.findOne({ slug: req.params.id });
    }

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Removed Auth Check

    await Tournament.deleteOne({ _id: tournament._id });
    
    res.status(200).json({ id: req.params.id });
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
};
