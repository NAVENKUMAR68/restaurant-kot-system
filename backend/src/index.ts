import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-kot';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes Placeholder
app.get('/api', (req, res) => {
    res.send('Smart KOT API is running');
});

// --- SINGLE PLATFORM DEPLOYMENT: SERVE FRONTEND ---
import path from 'path';
const distPath = path.join(__dirname, '../../dist');

// Serve static files from the Vite build
app.use(express.static(distPath));

// Handle React routing (Catch-all)
app.get('/*splat', (req, res) => {
    if (req.path.startsWith('/api')) return; // Don't catch API routes
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };
