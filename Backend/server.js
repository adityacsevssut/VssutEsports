const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

const app = express();

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'https://vssut-esports.vercel.app', 'https://vssut-esports-frontend.vercel.app'], 
    credentials: true,
};
app.use(cors(corsOptions));
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
