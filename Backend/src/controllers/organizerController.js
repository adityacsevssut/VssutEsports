const Organizer = require('../models/Organizer');

// @desc    Get all organizers (optionally filter by game)
// @route   GET /api/organizers?game=freefire
// @access  Public
const getOrganizers = async (req, res) => {
  try {
    const { game } = req.query;
    let query = {};
    if (game) {
      query.game = game;
    }
    const organizers = await Organizer.find(query);
    res.status(200).json(organizers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single organizer
// @route   GET /api/organizers/:id (id can be _id or slug)
// @access  Public
const getOrganizer = async (req, res) => {
  try {
    let organizer;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        organizer = await Organizer.findById(req.params.id);
    } 
    if (!organizer) {
        organizer = await Organizer.findOne({ slug: req.params.id });
    }

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    res.status(200).json(organizer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create organizer
// @route   POST /api/organizers
// @access  Public (for now)
const createOrganizer = async (req, res) => {
  try {
    const organizer = await Organizer.create(req.body);
    res.status(201).json(organizer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update organizer
// @route   PUT /api/organizers/:id
// @access  Public (for now)
const updateOrganizer = async (req, res) => {
  try {
    let organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
         organizer = await Organizer.findOne({ slug: req.params.id });
    }

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const updatedOrganizer = await Organizer.findByIdAndUpdate(organizer._id, req.body, {
      new: true,
    });
    res.status(200).json(updatedOrganizer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete organizer
// @route   DELETE /api/organizers/:id
// @access  Public (for now)
const deleteOrganizer = async (req, res) => {
  try {
    let organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
         organizer = await Organizer.findOne({ slug: req.params.id });
    }

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    await Organizer.deleteOne({ _id: organizer._id });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrganizers,
  getOrganizer,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer
};
