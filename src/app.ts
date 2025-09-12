import express from 'express';
import env from './config/env.ts';
import router from './routes/index.routes.ts';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const app = express();

// middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : env.DOMAIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());

// routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

export default app;
