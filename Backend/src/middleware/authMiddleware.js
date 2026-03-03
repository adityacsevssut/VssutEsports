const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check role to determine where to find user
      if (decoded.role === 'player') {
          // It's a player, check Player model
          // Dynamically require to avoid circular deps if any (though usually fine here)
          const Player = require('../models/Player');
          req.user = await Player.findById(decoded.id).select('-password');
      } else if (decoded.role && (decoded.role.startsWith('partner_') || decoded.role === 'developer')) {
          // Hardcoded partner/developer
          // They don't have a DB entry, so we manually reconstruct the user object from token/hardcoded list if needed
          // For now, just passing what we have in token is enough for basic auth checks
          req.user = {
              id: decoded.id, // This is email for partners
              email: decoded.id,
              role: decoded.role,
              // Add dummy values if needed by other controllers
              username: decoded.role === 'developer' ? 'Developer' : 'Partner',
              allowedGames: ['all'] // Or restrict based on partner role
          };
      } else {
          // Admin / Superadmin (User model)
          req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
}

module.exports = { protect, adminOnly };
