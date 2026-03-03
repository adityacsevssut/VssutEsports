const express = require('express');
const router = express.Router();
const { 
    getOrganizers, 
    getOrganizer, 
    createOrganizer, 
    updateOrganizer, 
    deleteOrganizer 
} = require('../controllers/organizerController');

// No auth protection as requested
router.route('/')
    .get(getOrganizers)
    .post(createOrganizer);

router.route('/:id')
    .get(getOrganizer)
    .put(updateOrganizer)
    .delete(deleteOrganizer);

module.exports = router;
