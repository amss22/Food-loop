/**
 * AI Priority Scorer for FoodLoop
 * Scores food listings based on: urgency (time-to-expiry), distance, and demand
 * Score range: 0-100 (higher = more urgent/priority)
 */

const URGENCY_WEIGHTS = {
  critical: 40,  // < 1 hour
  high: 30,      // 1-3 hours
  medium: 20,    // 3-6 hours
  low: 10,       // 6-24 hours
};

/**
 * Calculate urgency level based on time to expiry
 */
function getUrgencyLevel(expiryAt) {
  const now = new Date();
  const expiry = new Date(expiryAt);
  const hoursLeft = (expiry - now) / (1000 * 60 * 60);

  if (hoursLeft <= 0) return { level: 'expired', hoursLeft: 0 };
  if (hoursLeft <= 1) return { level: 'critical', hoursLeft };
  if (hoursLeft <= 3) return { level: 'high', hoursLeft };
  if (hoursLeft <= 6) return { level: 'medium', hoursLeft };
  return { level: 'low', hoursLeft };
}

/**
 * Calculate distance score (0-30 points, closer = higher score)
 */
function getDistanceScore(distanceKm) {
  if (distanceKm <= 1) return 30;
  if (distanceKm <= 3) return 25;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 10) return 15;
  if (distanceKm <= 20) return 10;
  if (distanceKm <= 50) return 5;
  return 1;
}

/**
 * Calculate quantity score (0-20 points, more = higher priority)
 */
function getQuantityScore(quantity, unit) {
  const kgEquivalent = unit === 'portions' ? quantity * 0.3 : 
                       unit === 'liters' ? quantity * 0.9 : 
                       unit === 'boxes' ? quantity * 2 : 
                       unit === 'packets' ? quantity * 0.5 : quantity;
  
  if (kgEquivalent >= 100) return 20;
  if (kgEquivalent >= 50) return 15;
  if (kgEquivalent >= 20) return 12;
  if (kgEquivalent >= 10) return 8;
  if (kgEquivalent >= 5) return 5;
  return 2;
}

/**
 * Calculate Haversine distance between two lat/lng points
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Main AI scoring function
 * @param {Object} listing - Food listing object
 * @param {Object} receiverLocation - {lat, lng} of the receiver
 * @returns {Object} { score, urgencyLevel, hoursLeft, distanceKm, breakdown }
 */
function scoreListing(listing, receiverLocation = null) {
  const { level: urgencyLevel, hoursLeft } = getUrgencyLevel(listing.expiryAt);
  
  if (urgencyLevel === 'expired') {
    return { score: 0, urgencyLevel: 'expired', hoursLeft: 0, distanceKm: null, breakdown: {} };
  }

  const urgencyScore = URGENCY_WEIGHTS[urgencyLevel] || 10;
  const quantityScore = getQuantityScore(listing.quantity, listing.unit);

  let distanceScore = 10; // default if no receiver location
  let distanceKm = null;

  if (receiverLocation && listing.location?.coordinates?.length === 2) {
    const [lngDonor, latDonor] = listing.location.coordinates;
    distanceKm = calculateDistance(receiverLocation.lat, receiverLocation.lng, latDonor, lngDonor);
    distanceScore = getDistanceScore(distanceKm);
  }

  // Bonus for emergency listings
  const emergencyBonus = listing.isEmergency ? 10 : 0;

  const score = Math.min(100, urgencyScore + quantityScore + distanceScore + emergencyBonus);

  return {
    score: Math.round(score),
    urgencyLevel,
    hoursLeft: Math.round(hoursLeft * 10) / 10,
    distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
    breakdown: { urgencyScore, quantityScore, distanceScore, emergencyBonus },
  };
}

/**
 * Sort and match listings for a receiver
 */
function matchListingsForReceiver(listings, receiverLocation, maxDistance = 50) {
  const scored = listings
    .map(listing => {
      const result = scoreListing(listing, receiverLocation);
      return { ...listing.toObject ? listing.toObject() : listing, aiScore: result.score, ...result };
    })
    .filter(l => {
      if (l.urgencyLevel === 'expired') return false;
      if (maxDistance && l.distanceKm !== null && l.distanceKm > maxDistance) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Simple waste prediction based on historical patterns
 */
function predictWaste(historicalData) {
  if (!historicalData || historicalData.length === 0) {
    return { predictedWasteKg: 0, confidence: 0, trend: 'stable' };
  }

  const values = historicalData.map(d => d.wastedKg || 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
  
  const trend = recent > avg * 1.1 ? 'increasing' : recent < avg * 0.9 ? 'decreasing' : 'stable';
  
  return {
    predictedWasteKg: Math.round(recent * 1.05),
    confidence: Math.min(95, 60 + values.length * 2),
    trend,
    avgWasteKg: Math.round(avg),
  };
}

module.exports = { scoreListing, matchListingsForReceiver, getUrgencyLevel, calculateDistance, predictWaste };
