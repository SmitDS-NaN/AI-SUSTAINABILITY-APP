import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 AI requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests from this client IP. Please try again after 15 minutes.'
  }
});
