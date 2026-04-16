import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { logger, requestLogger } from './lib/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─── REQUEST LOGGER ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── RATE LIMITERS ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { error: 'Too many requests, slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── ROUTES ─────────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/payment', apiLimiter, paymentRoutes);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (_req, res) => {
    res.send('Smart KOT API is running');
});

// ─── DATABASE ────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-kot';

mongoose.connect(MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error', { error: String(err) }));

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });
    socket.on('disconnect', () => {
        logger.info('Socket disconnected', { socketId: socket.id });
    });
});

// ─── SERVE FRONTEND (monolith mode) ─────────────────────────────────────────
import path from 'path';
if (process.env.SERVE_FRONTEND === 'true') {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));
    app.get('/*splat', (req, res) => {
        if (req.path.startsWith('/api')) return;
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

export { io };
