const express = require('express');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { sendEmergencyAlert } = require('../services/notifications');

const router = express.Router();

// GET /api/admin/stats - Platform-wide analytics
router.get('/stats', auth, role('admin'), async (req, res) => {
  try {
    const [totalUsers, totalListings, totalDonations, deliveredDonations] = await Promise.all([
      User.countDocuments(),
      FoodListing.countDocuments(),
      Donation.countDocuments(),
      Donation.find({ status: 'delivered' }),
    ]);

    const kgSaved = deliveredDonations.reduce((a, d) => a + (d.kgDelivered || 0), 0);
    const mealsSaved = deliveredDonations.reduce((a, d) => a + (d.mealsProvided || 0), 0);
    const co2Saved = deliveredDonations.reduce((a, d) => a + (d.co2Saved || 0), 0);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const listingsByStatus = await FoodListing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Last 7 days donations
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDonations = await Donation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalListings, totalDonations,
        deliveredCount: deliveredDonations.length,
        kgSaved: Math.round(kgSaved),
        mealsSaved: Math.round(mealsSaved),
        co2Saved: Math.round(co2Saved * 10) / 10,
        usersByRole,
        listingsByStatus,
        recentDonations,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users - All users
router.get('/users', auth, role('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role: filterRole, search } = req.query;
    let query = {};
    if (filterRole) query.role = filterRole;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/verify - Verify an NGO/receiver
router.put('/users/:id/verify', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/toggle - Toggle user active status
router.put('/users/:id/toggle', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.active = !user.active;
    await user.save();
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/emergency - Trigger emergency alert
router.post('/emergency', auth, role('admin'), async (req, res) => {
  try {
    const { title, message, location } = req.body;
    await sendEmergencyAlert(req.io, { title, message, location });
    res.json({ success: true, message: 'Emergency alert sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
