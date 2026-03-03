const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/tournaments', require('./src/routes/tournamentRoutes'));
app.use('/api/organizers', require('./src/routes/organizerRoutes')); // Add Organizers
app.use('/api/registrations', require('./src/routes/registrationRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/payment', require('./src/routes/paymentRoutes'));

// Root route
app.get('/', (req, res) => {
    res.send('VSSUT Esports API is running');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
