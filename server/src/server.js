import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import usageRoutes from './routes/usage.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiRoutes from './routes/ai.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Vercel Serverless Path Normalizer (handles both /api/* and /* routes)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/' && req.url !== '/health') {
    req.url = '/api' + req.url;
  }
  next();
});

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'EcoLedger API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalsRoutes);

// Global Error Handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 EcoLedger Server running on http://localhost:${PORT}`);
    console.log(`🌱 Environment: ${env.NODE_ENV}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
      console.error(`💡 Solution: Stop any existing node instance using port ${PORT} or change PORT in server/.env`);
      process.exit(1);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });

  const gracefulShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.once('SIGUSR2', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

export default app;
