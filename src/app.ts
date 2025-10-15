import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.ts';
import router from './routes/index.routes.ts';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
//import { metricsMiddleware, metricsEndpoint } from './monitoring.ts';

// --- chemins de base ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- middlewares globaux ---
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// Configuration Helmet avec CSP très permissive pour les blobs audio
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'", "blob:", "data:"],
      mediaSrc: ["'self'", "blob:", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'self'", "blob:", "data:"],
      baseUri: ["'self'"],
      frameSrc: ["'self'", "blob:"],
    },
  },
}));

app.use(compression());

// --- CORS ---
if (env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: env.DOMAIN,
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
  );
}

// --- Routes API principales ---
app.use('/api', router);

// --- Gestion du frontend (React build en production) ---
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  // Toutes les autres routes renvoient index.html (pour le routing React)
  // SAUF /metrics qui doit être accessible pour Prometheus
  app.use((req, res) => {
    /*/if (req.path === '/metrics') {
      return metricsEndpoint(req, res);
    }*/
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // En développement, renvoyer un JSON pour les routes inconnues
  app.use((req, res) => {
    return res.status(404).json({
      error: {
        en: 'Route not found',
        fr: 'Route non trouvée',
        es: 'Ruta no encontrada',
        ar: 'الطريق غير موجود',
      },
    });
  });
}

// --- Monitoring Prometheus ---
/*app.use(metricsMiddleware); // mesure toutes les requêtes
app.get('/metrics', metricsEndpoint); // exposé pour Prometheus*/

export default app;
