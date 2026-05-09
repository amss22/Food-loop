const Notification = require('../models/Notification');

/**
 * Send a notification to a user (DB + Socket.io)
 */
async function sendNotification(io, { recipientId, type, title, message, data = {}, priority = 'medium', actionUrl = '' }) {
  try {
    // Save to DB
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
      priority,
      actionUrl,
    });

    // Emit via Socket.io if user is connected
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', {
        id: notification._id,
        type,
        title,
        message,
        data,
        priority,
        actionUrl,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Error sending notification:', error.message);
  }
}

/**
 * Send emergency alert to all volunteers and receivers
 */
async function sendEmergencyAlert(io, { listingId, title, message, location }) {
  if (io) {
    io.to('role:volunteer').to('role:receiver').emit('emergency_alert', {
      listingId,
      title,
      message,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  // Mock WhatsApp/SMS alert
  console.log(`[SMS/WhatsApp Mock] EMERGENCY: ${title} - ${message}`);
  console.log(`[SMS/WhatsApp Mock] Location: ${JSON.stringify(location)}`);
}

/**
 * Mock WhatsApp/SMS notification
 */
function sendSMSAlert(phone, message) {
  console.log(`[SMS Mock] To: ${phone} | Message: ${message}`);
  // TODO: Replace with Twilio integration:
  // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // twilio.messages.create({ body: message, from: process.env.TWILIO_PHONE, to: phone });
}

module.exports = { sendNotification, sendEmergencyAlert, sendSMSAlert };
