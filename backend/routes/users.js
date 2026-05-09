const express = require('express');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// GET /api/users/profile - Get own profile
router.get('/profile', auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/users/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, organization, bio, location, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, organization, bio, location, preferences },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/dashboard/stats - Dashboard stats for any role
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let stats = {};

    if (role === 'donor') {
      const [listings, donations] = await Promise.all([
        FoodListing.find({ donor: userId }),
        Donation.find({ donor: userId }),
      ]);
      const active = listings.filter(l => ['available', 'claimed', 'in_transit'].includes(l.status));
      const delivered = donations.filter(d => d.status === 'delivered');
      stats = {
        totalListings: listings.length,
        activeListings: active.length,
        totalDelivered: delivered.length,
        kgFoodSaved: req.user.stats.kgFoodSaved || 0,
        mealsProvided: req.user.stats.mealsProvided || 0,
        co2Saved: req.user.stats.co2Saved || 0,
      };
    } else if (role === 'receiver') {
      const donations = await Donation.find({ receiver: userId });
      const pending = donations.filter(d => ['pending', 'accepted'].includes(d.status));
      const completed = donations.filter(d => d.status === 'delivered');
      stats = {
        totalClaimed: donations.length,
        pendingPickups: pending.length,
        totalReceived: completed.length,
        kgReceived: completed.reduce((a, d) => a + (d.kgDelivered || 0), 0),
        mealsProvided: completed.reduce((a, d) => a + (d.mealsProvided || 0), 0),
      };
    } else if (role === 'volunteer') {
      const deliveries = await Donation.find({ volunteer: userId });
      stats = {
        totalDeliveries: deliveries.length,
        activeDeliveries: deliveries.filter(d => d.status === 'volunteer_assigned').length,
        completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
        kgDelivered: deliveries.reduce((a, d) => a + (d.kgDelivered || 0), 0),
      };
    }

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/nearby - Get nearby donors/receivers
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 20, role: filterRole } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Location required' });

    const query = {
      _id: { $ne: req.user._id },
      active: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(maxDistance) * 1000,
        }
      }
    };
    if (filterRole) query.role = filterRole;

    const users = await User.find(query).select('name organization avatar role location rating').limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
