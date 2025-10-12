// src/monitoring.ts
import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

const register = new client.Registry();

// Collecte des métriques système (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Crée un compteur de requêtes
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

// Crée un histogramme pour mesurer la durée
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 1, 3, 5],
});

// Enregistre les métriques
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware Express pour mesurer chaque requête
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    const route = req.route?.path || req.path || 'unknown';
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
  });

  next();
}

// Route pour exposer les métriques
export async function metricsEndpoint(req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
