const express = require('express');
const router = express.Router();
const { 
    registerTeam, 
    getRegistrations, 
    updateRegistrationStatus,
    getMyRegistrations
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(registerTeam);

router.route('/my')
    .get(protect, getMyRegistrations);

router.route('/tournament/:tournamentId')
    .get(protect, getRegistrations);

router.route('/:id')
    .put(protect, updateRegistrationStatus);

module.exports = router;
