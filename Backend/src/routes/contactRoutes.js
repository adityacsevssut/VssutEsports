const express = require('express');
const router = express.Router();
const { sendOtp, submitForm } = require('../controllers/contactController');

router.post('/send-otp', sendOtp);
router.post('/submit', submitForm);

module.exports = router;
