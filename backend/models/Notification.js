const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_listing', 'listing_claimed', 'volunteer_assigned', 'pickup_scheduled',
      'food_picked_up', 'food_delivered', 'emergency_alert', 'qr_verified',
      'listing_expiring', 'system', 'rating_received', 'new_match'
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  actionUrl: { type: String },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
