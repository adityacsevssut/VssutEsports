const Organizer = require('../models/Organizer');
const apiCache = require('../utils/cache');

// @desc    Get all organizers (optionally filter by game)
// @route   GET /api/organizers?game=freefire
// @access  Public
const getOrganizers = async (req, res) => {
  try {
    const { game } = req.query;
    const cacheKey = game ? `organizers_${game}` : 'organizers_all';

    if (apiCache.has(cacheKey)) {
      return res.status(200).json(apiCache.get(cacheKey));
    }

    let query = {};
    if (game) {
      query.game = game;
    }
    const organizers = await Organizer.find(query);

    apiCache.set(cacheKey, organizers);
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
    const cacheKey = `organizer_${req.params.id}`;
    if (apiCache.has(cacheKey)) {
      return res.status(200).json(apiCache.get(cacheKey));
    }

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

    apiCache.set(cacheKey, organizer);
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
    apiCache.flushAll(); // clear cache
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

    apiCache.flushAll(); // clear cache
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
    
    apiCache.flushAll(); // clear cache
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
