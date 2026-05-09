const express = require('express');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { scoreListing, matchListingsForReceiver } = require('../services/aiMatcher');
const { sendNotification, sendEmergencyAlert } = require('../services/notifications');

const router = express.Router();

// Comprehensive Demo Data
const DEMO_LISTINGS = [
  { 
    _id: 'demo-1', title: 'Fresh Wedding Biryani', foodType: 'cooked', quantity: 45, unit: 'kg', 
    expiryAt: new Date(Date.now() + 2.5 * 3600000).toISOString(), urgencyLevel: 'high', 
    aiScore: 92, location: { address: 'Outer Circle, Connaught Place', city: 'Delhi', coordinates: [77.2167, 28.6315] }, 
    dietary: { isVegetarian: false, isHalal: true }, donor: { name: 'Rahul Sharma', organization: 'Royal Banquet Hall', rating: 4.8 },
    description: 'High-quality chicken biryani from a large wedding event. Properly stored in thermal containers.',
    pickupInstructions: 'Enter from Gate 4, ask for the kitchen manager.',
    images: [], isEmergency: false, status: 'available', views: 12, createdAt: new Date().toISOString()
  },
  { 
    _id: 'demo-2', title: 'Artisan Bread & Pastries', foodType: 'bakery', quantity: 15, unit: 'kg', 
    expiryAt: new Date(Date.now() + 5 * 3600000).toISOString(), urgencyLevel: 'medium', 
    aiScore: 78, location: { address: 'Market Block 2, Lajpat Nagar', city: 'Delhi', coordinates: [77.2389, 28.5677] }, 
    dietary: { isVegetarian: true }, donor: { name: 'Priya Mehta', organization: 'The Golden Whisk', rating: 4.9 },
    description: 'Assorted sourdough bread, croissants, and muffins. Freshly baked this morning.',
    pickupInstructions: 'Pick up from the front desk before 8 PM.',
    images: [], isEmergency: false, status: 'available', views: 8, createdAt: new Date().toISOString()
  },
  { 
    _id: 'demo-3', title: '🚨 Emergency: Nutritious Dal & Rice', foodType: 'cooked', quantity: 30, unit: 'kg', 
    expiryAt: new Date(Date.now() + 0.5 * 3600000).toISOString(), urgencyLevel: 'critical', 
    aiScore: 98, location: { address: 'Ajmal Khan Road, Karol Bagh', city: 'Delhi', coordinates: [77.1888, 28.6550] }, 
    dietary: { isVegetarian: true, isVegan: true }, donor: { name: 'Amit Gupta', organization: 'Hotel Metropolis', rating: 4.7 },
    description: 'Large quantity of steaming hot dal and steamed rice. Needs immediate distribution to avoid waste.',
    pickupInstructions: 'Drive to the loading dock behind the hotel.',
    images: [], isEmergency: true, status: 'available', views: 25, createdAt: new Date().toISOString()
  },
  { 
    _id: 'demo-4', title: 'Organic Seasonal Vegetables', foodType: 'fruits_vegetables', quantity: 25, unit: 'kg', 
    expiryAt: new Date(Date.now() + 24 * 3600000).toISOString(), urgencyLevel: 'low', 
    aiScore: 65, location: { address: 'Subzi Mandi, Azadpur', city: 'Delhi', coordinates: [77.1750, 28.7050] }, 
    dietary: { isVegetarian: true, isVegan: true }, donor: { name: 'Suresh Kumar', organization: 'Fresh Farm Co.', rating: 4.5 },
    description: 'A mix of fresh carrots, spinach, and bell peppers. Slight surface blemishes but perfectly edible.',
    pickupInstructions: 'Ask for Stall 142 at the main entrance.',
    images: [], isEmergency: false, status: 'available', views: 5, createdAt: new Date().toISOString()
  },
  { 
    _id: 'demo-5', title: 'Dairy Essentials (Milk & Yogurt)', foodType: 'dairy', quantity: 20, unit: 'liters', 
    expiryAt: new Date(Date.now() + 3 * 3600000).toISOString(), urgencyLevel: 'high', 
    aiScore: 84, location: { address: 'Block C, South Extension II', city: 'Delhi', coordinates: [77.2197, 28.5683] }, 
    dietary: { isVegetarian: true }, donor: { name: 'Vikram Singh', organization: 'DairyPlus Distributors', rating: 4.6 },
    description: 'Short-dated milk cartons and fresh yogurt cups. Must be kept refrigerated.',
    pickupInstructions: 'Call the driver at 9876543210 upon arrival.',
    images: [], isEmergency: false, status: 'available', views: 15, createdAt: new Date().toISOString()
  },
  { 
    _id: 'demo-6', title: 'Corporate Event Lunch Boxes', foodType: 'packaged', quantity: 60, unit: 'boxes', 
    expiryAt: new Date(Date.now() + 1.5 * 3600000).toISOString(), urgencyLevel: 'high', 
    aiScore: 89, location: { address: 'Tech Park, Nehru Place', city: 'Delhi', coordinates: [77.2490, 28.5480] }, 
    dietary: { isVegetarian: true }, donor: { name: 'Neha Kapoor', organization: 'Global Tech Solutions', rating: 4.8 },
    description: 'Individually packed meal boxes containing paneer butter masala, roti, and salad.',
    pickupInstructions: 'Security will guide you to the cafeteria on the 4th floor.',
    images: [], isEmergency: false, status: 'available', views: 18, createdAt: new Date().toISOString()
  },
];

// Helper to get demo listings with AI scores
const getDemoListings = () => {
  return DEMO_LISTINGS.map(l => {
    const scored = scoreListing(l);
    return { ...l, aiScore: scored.score, urgencyLevel: scored.urgencyLevel, hoursLeft: scored.hoursLeft };
  });
};

// GET /api/food - Get all available listings (with optional filters)
router.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDemoMode = mongoose.connection.readyState !== 1;

    const { status = 'available', foodType, city, lat, lng, maxDistance = 50, page = 1, limit = 20 } = req.query;
    
    if (isDemoMode) {
      let filtered = getDemoListings();
      if (foodType && foodType !== 'all') filtered = filtered.filter(l => l.foodType === foodType);
      if (city) filtered = filtered.filter(l => l.location.city.toLowerCase().includes(city.toLowerCase()));
      
      return res.json({ success: true, listings: filtered, count: filtered.length, demo: true });
    }

    let query = { status };
    if (foodType) query.foodType = foodType;

    let listings;
    if (lat && lng) {
      listings = await FoodListing.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(maxDistance) * 1000,
          }
        }
      }).populate('donor', 'name organization avatar rating').limit(parseInt(limit));
    } else {
      listings = await FoodListing.find(query)
        .populate('donor', 'name organization avatar rating')
        .sort({ aiScore: -1, createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    const scored = listings.map(l => {
      const result = scoreListing(l);
      const obj = l.toObject();
      return { ...obj, aiScore: result.score, urgencyLevel: result.urgencyLevel, hoursLeft: result.hoursLeft };
    });

    res.json({ success: true, listings: scored, count: scored.length });
  } catch (err) {
    const demo = getDemoListings();
    res.json({ success: true, listings: demo, count: demo.length, demo: true, error: err.message });
  }
});

// GET /api/food/:id - Get single listing
router.get('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDemoMode = mongoose.connection.readyState !== 1;

    if (isDemoMode || req.params.id.startsWith('demo-')) {
      const listing = getDemoListings().find(l => l._id === req.params.id);
      if (listing) {
        return res.json({ success: true, listing, demo: true });
      }
      if (isDemoMode) return res.status(404).json({ success: false, message: 'Demo listing not found' });
    }

    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'name organization avatar rating phone location')
      .populate('claimedBy', 'name organization avatar');
    
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    
    listing.views += 1;
    await listing.save();

    const scored = scoreListing(listing);
    res.json({ success: true, listing: { ...listing.toObject(), ...scored } });
  } catch (err) {
    // Check if ID is a demo ID even if DB is connected
    const demoListing = getDemoListings().find(l => l._id === req.params.id);
    if (demoListing) return res.json({ success: true, listing: demoListing, demo: true });
    
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/food - Create food listing (donor only)
router.post('/', auth, role('donor', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, foodType, quantity, unit, servings, expiryAt, 
            address, city, pincode, lat, lng, isVegetarian, isVegan, isHalal,
            isGlutenFree, pickupInstructions, isEmergency, tags } = req.body;

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const listing = await FoodListing.create({
      donor: req.user._id,
      title, description, foodType, quantity: parseFloat(quantity), unit,
      servings: parseInt(servings) || 0,
      expiryAt: new Date(expiryAt),
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng || 77.2090), parseFloat(lat || 28.6139)],
        address, city, pincode,
      },
      images,
      dietary: {
        isVegetarian: isVegetarian === 'true',
        isVegan: isVegan === 'true',
        isHalal: isHalal === 'true',
        isGlutenFree: isGlutenFree === 'true',
      },
      pickupInstructions,
      isEmergency: isEmergency === 'true',
      tags: tags ? JSON.parse(tags) : [],
    });

    // Compute AI score
    const scored = scoreListing(listing);
    listing.aiScore = scored.score;
    listing.urgencyLevel = scored.urgencyLevel;
    await listing.save();

    await listing.populate('donor', 'name organization avatar');

    // Broadcast to receivers via Socket.io
    if (req.io) {
      req.io.to('role:receiver').to('role:volunteer').emit('new_listing', {
        listing: { ...listing.toObject(), ...scored },
      });
    }

    if (isEmergency === 'true' && req.io) {
      await sendEmergencyAlert(req.io, {
        listingId: listing._id,
        title: `🚨 Emergency Food Rescue: ${title}`,
        message: `${quantity} ${unit} of ${foodType} food needs urgent pickup in ${city}!`,
        location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
      });
    }

    // Update donor stats
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalDonations': 1 }
    });

    res.status(201).json({ success: true, listing: { ...listing.toObject(), ...scored } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/food/:id - Update listing
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = req.body;
    Object.assign(listing, updates);
    await listing.save();

    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/food/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = 'cancelled';
    await listing.save();
    res.json({ success: true, message: 'Listing cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/food/donor/mine - Donor's listings
router.get('/donor/mine', auth, role('donor', 'admin'), async (req, res) => {
  try {
    const listings = await FoodListing.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const scored = listings.map(l => {
      const result = scoreListing(l);
      return { ...l.toObject(), aiScore: result.score, urgencyLevel: result.urgencyLevel, hoursLeft: result.hoursLeft };
    });

    res.json({ success: true, listings: scored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
