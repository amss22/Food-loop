const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Fallback for mock users in demo mode
      if (String(decoded.id).startsWith('mock_id_')) {
        const role = String(decoded.id).split('_')[2];
        user = {
          _id: decoded.id,
          name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
          role: role,
          active: true
        };
      }
    }

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: 'Auth error' });
  }
};

module.exports = authMiddleware;
