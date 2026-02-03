const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

require('dotenv').config();


const connectDB = require('./config/database');
const { initializeSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const hospitalRoutes = require('./routes/hospital');
const adminRoutes = require('./routes/admin');
const matchingRoutes = require('./routes/matching');
const publicRoutes = require('./routes/public');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');


const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? true : (process.env.CLIENT_URL || 'http://localhost:5173'),
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);


// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Organ Donor API is running',
        socket: io ? 'Connected' : 'Disconnected',
    });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔌 Socket.io initialized`);
});

module.exports = { app, io };
