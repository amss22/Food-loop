const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'bakery', 'beverages', 'fruits_vegetables', 'dairy', 'other'],
    required: true,
  },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, enum: ['kg', 'liters', 'portions', 'boxes', 'packets'], default: 'kg' },
  servings: { type: Number, default: 0 },
  images: [{ type: String }],
  expiryAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'claimed', 'in_transit', 'delivered', 'expired', 'cancelled'],
    default: 'available',
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, required: true },
    city: { type: String },
    pincode: { type: String },
  },
  tags: [{ type: String }],
  dietary: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    allergens: [{ type: String }],
  },
  aiScore: { type: Number, default: 0 }, // AI priority score 0-100
  urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimedAt: { type: Date, default: null },
  isEmergency: { type: Boolean, default: false },
  pickupInstructions: { type: String, maxlength: 300 },
  views: { type: Number, default: 0 },
}, { timestamps: true });

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiryAt: 1 });
foodListingSchema.index({ aiScore: -1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
