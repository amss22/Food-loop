const express = require('express');
const Donation = require('../models/Donation');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { generateQRHash, generateQRCode, verifyQRHash } = require('../services/qrService');
const { sendNotification } = require('../services/notifications');

const router = express.Router();

// POST /api/donations/claim/:listingId - Receiver claims a listing
router.post('/claim/:listingId', auth, role('receiver', 'admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDemoMode = mongoose.connection.readyState !== 1;
    let listing;

    if (isDemoMode || req.params.listingId.startsWith('demo-')) {
      // Import the demo listings from the same logic (ideally should be in a service)
      // For simplicity in this demo, we'll just mock the response
      return res.status(201).json({ 
        success: true, 
        donation: {
          _id: 'demo-donation-' + Date.now(),
          listing: req.params.listingId,
          status: 'accepted',
          createdAt: new Date()
        }, 
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=demo-claim-' + req.params.listingId,
        demo: true
      });
    }

    listing = await FoodListing.findById(req.params.listingId).populate('donor');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'available') {
      return res.status(409).json({ success: false, message: 'Listing is no longer available' });
    }

    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    listing.claimedAt = new Date();
    await listing.save();

    const donation = await Donation.create({
      listing: listing._id,
      donor: listing.donor._id,
      receiver: req.user._id,
      status: 'accepted',
      timeline: [{ status: 'accepted', note: 'Listing claimed by receiver' }],
    });

    // Generate QR hash
    const qrHash = generateQRHash(
      donation._id.toString(),
      listing._id.toString(),
      Math.floor(new Date(donation.createdAt).getTime() / 1000) * 1000
    );
    donation.qrHash = qrHash;
    await donation.save();

    // Generate QR code
    const qrDataUrl = await generateQRCode(qrHash, donation._id);

    // Notify donor
    await sendNotification(req.io, {
      recipientId: listing.donor._id,
      type: 'listing_claimed',
      title: '🎉 Your food listing was claimed!',
      message: `${req.user.name} (${req.user.organization || 'NGO'}) has claimed "${listing.title}"`,
      data: { donationId: donation._id, listingId: listing._id },
      priority: 'high',
      actionUrl: `/dashboard/donor`,
    });

    // Broadcast to volunteers
    if (req.io) {
      req.io.to('role:volunteer').emit('new_pickup_opportunity', {
        donationId: donation._id,
        listingTitle: listing.title,
        location: listing.location,
      });
    }

    res.status(201).json({ success: true, donation, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/donations/:id/verify-qr - Verify QR code on pickup
router.post('/:id/verify-qr', auth, async (req, res) => {
  try {
    const { qrHash } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    if (donation.qrHash !== qrHash) {
      return res.status(400).json({ success: false, message: 'Invalid QR code' });
    }

    donation.qrVerified = true;
    donation.qrVerifiedAt = new Date();
    donation.status = 'picked_up';
    donation.pickedUpAt = new Date();
    donation.timeline.push({ status: 'picked_up', note: 'QR verified - food picked up', updatedBy: req.user._id });
    await donation.save();

    await FoodListing.findByIdAndUpdate(donation.listing, { status: 'in_transit' });

    // Notify donor and receiver
    await sendNotification(req.io, {
      recipientId: donation.donor,
      type: 'food_picked_up',
      title: '✅ Food picked up!',
      message: 'Your food donation has been picked up successfully.',
      priority: 'medium',
    });

    res.json({ success: true, message: 'QR verified! Pickup confirmed.', donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/donations/:id/deliver - Mark as delivered
router.post('/:id/deliver', auth, role('volunteer', 'receiver', 'admin'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('listing');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    donation.status = 'delivered';
    donation.deliveredAt = new Date();
    donation.timeline.push({ status: 'delivered', note: 'Food delivered successfully', updatedBy: req.user._id });

    // Calculate impact
    const kgDelivered = donation.listing?.quantity || 0;
    donation.kgDelivered = kgDelivered;
    donation.mealsProvided = Math.round(kgDelivered * 3.3);
    donation.co2Saved = Math.round(kgDelivered * 2.5 * 10) / 10;

    await donation.save();
    await FoodListing.findByIdAndUpdate(donation.listing._id, { status: 'delivered' });

    // Update stats
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { 'stats.kgFoodSaved': kgDelivered, 'stats.co2Saved': donation.co2Saved, 'stats.mealsProvided': donation.mealsProvided }
    });
    await User.findByIdAndUpdate(donation.receiver, {
      $inc: { 'stats.totalReceived': 1 }
    });
    if (donation.volunteer) {
      await User.findByIdAndUpdate(donation.volunteer, {
        $inc: { 'stats.totalDeliveries': 1 }
      });
    }

    // Notify all parties
    await sendNotification(req.io, {
      recipientId: donation.donor,
      type: 'food_delivered',
      title: '🌟 Delivery complete!',
      message: `${kgDelivered}kg of food delivered → ${donation.mealsProvided} meals provided!`,
      priority: 'high',
    });

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/my - Get user's donations
router.get('/my', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'donor') query.donor = req.user._id;
    else if (req.user.role === 'receiver') query.receiver = req.user._id;
    else if (req.user.role === 'volunteer') query.volunteer = req.user._id;

    const donations = await Donation.find(query)
      .populate('listing', 'title foodType quantity unit images location expiryAt')
      .populate('donor', 'name organization avatar')
      .populate('receiver', 'name organization avatar')
      .populate('volunteer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/:id - Get donation details
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('listing')
      .populate('donor', 'name organization avatar phone location')
      .populate('receiver', 'name organization avatar phone location')
      .populate('volunteer', 'name avatar phone');

    if (!donation) return res.status(404).json({ success: false, message: 'Not found' });

    // Re-generate QR for display
    let qrCode = null;
    if (donation.qrHash) {
      qrCode = await generateQRCode(donation.qrHash, donation._id);
    }

    res.json({ success: true, donation, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
