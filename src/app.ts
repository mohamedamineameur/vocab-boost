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
if (env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: "https://yourdomain.com",
      credentials: true,
    })
  );
} else {
app.use(
  cors({
    origin: [
      "http://localhost:5173",         
      "http://192.168.2.19:5173",      
    ],
    credentials: true,
  })
);}

app.use(compression());

// routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: { en: 'Route not found', fr: 'Route non trouvée', es: 'Ruta no encontrada', ar: 'الطريق غير موجود' } });
});

export default app;
