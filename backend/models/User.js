const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['donor', 'receiver', 'volunteer', 'admin'], 
    required: true,
    default: 'donor'
  },
  phone: { type: String, trim: true },
  organization: { type: String, trim: true },
  avatar: { type: String, default: null },
  bio: { type: String, maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.2090, 28.6139] }, // Delhi default
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
  },
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    kgFoodSaved: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    mealsProvided: { type: Number, default: 0 },
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
  },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
