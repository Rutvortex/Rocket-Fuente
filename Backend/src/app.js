import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import { generalRateLimit } from './middlewares/rateLimitMiddleware.js';
import errorHandler from './middlewares/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import enterpriseRoutes from './routes/enterpriseRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import aiDetectionRoutes from './routes/aiDetectionRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
app.use(generalRateLimit);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
const normalizeOrigin = (raw) => raw.trim().replace(/\/$/, '');
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://localhost:5173',
  'https://127.0.0.1:5173',
];
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);
const allowedOrigins = [...new Set([...envOrigins, ...defaultAllowedOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production';
    const isAllowedLocalNetwork = !isProduction && /^https?:\/\/192\.168\.\d+\.\d+:5173$/.test(normalizedOrigin)

    if (allowedOrigins.includes(normalizedOrigin) || isAllowedLocalNetwork) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`))
    }
  },
  credentials: true
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/enterprises', enterpriseRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/ai-detection', aiDetectionRoutes);
app.use('/api/v1/media', mediaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SocialNet API is running...' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
