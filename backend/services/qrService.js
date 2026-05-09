const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Generate a unique QR hash for a donation
 */
function generateQRHash(donationId, listingId, timestamp) {
  const data = `${donationId}:${listingId}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Generate QR code as base64 data URL
 */
async function generateQRCode(hash, donationId) {
  const qrData = JSON.stringify({
    hash,
    donationId,
    platform: 'FoodLoop',
    timestamp: Date.now(),
  });

  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#166534', light: '#f0fdf4' },
  });

  return qrDataUrl;
}

/**
 * Verify QR hash matches donation
 */
function verifyQRHash(providedHash, donation) {
  const expectedHash = generateQRHash(
    donation._id.toString(),
    donation.listing.toString(),
    Math.floor(new Date(donation.createdAt).getTime() / 1000) * 1000
  );
  return providedHash === donation.qrHash;
}

module.exports = { generateQRHash, generateQRCode, verifyQRHash };
