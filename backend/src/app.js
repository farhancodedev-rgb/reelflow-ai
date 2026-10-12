import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health.js';
import captionsRouter from './routes/captions.js';
import videoScriptRouter from './routes/videoScript.js';

const app = express();
app.disable('x-powered-by');

const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many AI generation requests. Please try again later.'
  }
});
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://reelflo-ai.netlify.app'
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'ReelFlow AI API',
    health: '/api/health'
  });
});

app.use('/api/health', healthRouter);
app.use('/api/captions/generate', generationLimiter);
app.use('/api/captions', captionsRouter);
app.use('/api/video-script/generate', generationLimiter);
app.use('/api/video-script', videoScriptRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_JSON',
      message: 'Request body contains invalid JSON.'
    });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      code: 'REQUEST_TOO_LARGE',
      message: 'Request body is too large.'
    });
  }

  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      success: false,
      code: 'CORS_ORIGIN_DENIED',
      message: 'This origin is not allowed.'
    });
  }

  console.error('Unhandled API error:', error?.message || 'Unknown error');

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred.'
  });
});


export default app;
