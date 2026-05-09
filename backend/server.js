require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('join', ({ userId, role }) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`role:${role}`);
    socket.join(`user:${userId}`);
    console.log(`[Socket] User ${userId} joined as ${role}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// Store connectedUsers globally for services
global.connectedUsers = connectedUsers;
global.io = io;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodloop')
  .then(() => {
    console.log('[DB] MongoDB connected successfully');
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`[Server] FoodLoop backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection error:', err.message);
    console.log('[Server] Running without MongoDB (demo mode)...');
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`[Server] FoodLoop backend running on http://localhost:${PORT} (no DB)`);
    });
  });

module.exports = { app, io };
