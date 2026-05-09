const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['donor', 'receiver', 'volunteer']).withMessage('Invalid role'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, email, password, role, phone, organization, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone, organization, location });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { email, password } = req.body;

    // --- DEMO MODE FALLBACK ---
    const isDemo = email.includes('demo.com') && password === 'demo123';
    if (isDemo) {
      const role = email.split('@')[0].replace('ngo', 'receiver');
      const mockUser = {
        _id: 'mock_id_' + role,
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
        email: email,
        role: role === 'receiver' ? 'receiver' : role,
        active: true,
        toPublicJSON: () => ({
          _id: 'mock_id_' + role,
          name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
          email: email,
          role: role === 'receiver' ? 'receiver' : role,
        })
      };
      const token = generateToken(mockUser._id);
      return res.json({ success: true, token, user: mockUser.toPublicJSON() });
    }
    // --------------------------

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.active) return res.status(403).json({ success: false, message: 'Account suspended' });

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) {
    // If DB is down but it's not a demo login, still fail gracefully
    res.status(500).json({ success: false, message: 'Database connection error or internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user });
});

module.exports = router;
