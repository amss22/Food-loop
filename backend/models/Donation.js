const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'volunteer_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'expired'],
    default: 'pending',
  },
  qrHash: { type: String, unique: true, sparse: true },
  qrVerified: { type: Boolean, default: false },
  qrVerifiedAt: { type: Date },
  route: {
    distance: { type: Number }, // km
    duration: { type: Number }, // minutes
    polyline: { type: String },
    waypoints: [{ lat: Number, lng: Number }],
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  feedback: {
    donorRating: { type: Number, min: 1, max: 5 },
    receiverRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 300 },
  },
  kgDelivered: { type: Number, default: 0 },
  mealsProvided: { type: Number, default: 0 },
  co2Saved: { type: Number, default: 0 },
  scheduledPickupAt: { type: Date },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
}, { timestamps: true });

donationSchema.index({ listing: 1 });
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ receiver: 1, status: 1 });
donationSchema.index({ volunteer: 1, status: 1 });

module.exports = mongoose.model('Donation', donationSchema);
