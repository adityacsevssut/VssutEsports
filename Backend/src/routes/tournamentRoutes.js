const express = require('express');
const router = express.Router();
const { 
    getTournaments, 
    getTournament, 
    createTournament, 
    updateTournament, 
    deleteTournament 
} = require('../controllers/tournamentController'); // Note: Controller might still have role checks inside, need to fix that if we want full public access

// REMOVED PROTECT MIDDLEWARE
router.route('/')
    .get(getTournaments)
    .post(createTournament);

router.route('/:id')
    .get(getTournament)
    .put(updateTournament)
    .delete(deleteTournament);

module.exports = router;
