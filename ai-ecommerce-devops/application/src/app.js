const express = require('express');
const client = require('prom-client');
const path = require('path');

function createApp({ pool = null } = {}) {
  const app = express();
  app.use(express.json());

  const register = new client.Registry();
  client.collectDefaultMetrics({ register });
  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register],
  });
  const ordersTotal = new client.Counter({
    name: 'orders_created_total', help: 'Orders created', registers: [register],
  });

  const products = [
    { id: 1, name: 'Wireless Mouse', price: 799 },
    { id: 2, name: 'Mechanical Keyboard', price: 3499 },
    { id: 3, name: 'USB-C Hub', price: 1999 },
    { id: 4, name: 'Laptop Stand', price: 1299 },
  ];
  const orders = [];

  // structured JSON access log (consumed by Filebeat/ELK)
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const sec = Number(process.hrtime.bigint() - start) / 1e9;
      const route = req.route ? req.route.path : req.path;
      httpDuration.labels(req.method, route, String(res.statusCode)).observe(sec);
      console.log(JSON.stringify({
        ts: new Date().toISOString(), level: res.statusCode >= 500 ? 'error' : 'info',
        msg: 'request', method: req.method, path: req.path,
        status: res.statusCode, duration_ms: Math.round(sec * 1000),
      }));
    });
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (_req, res) => {
    if (pool) {
      try { await pool.query('SELECT 1'); }
      catch (e) {
        console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'error', msg: 'database connection timeout', error: e.message }));
        return res.status(503).json({ status: 'db-unavailable' });
      }
    }
    res.json({ status: 'ready' });
  });
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.get('/api/products', (_req, res) => res.json(products));
  app.get('/api/products/:id', (req, res) => {
    const p = products.find((x) => x.id === Number(req.params.id));
    return p ? res.json(p) : res.status(404).json({ error: 'not found' });
  });
  app.post('/api/orders', (req, res) => {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });
    let total = 0;
    for (const it of items) {
      const p = products.find((x) => x.id === it.productId);
      if (!p) return res.status(400).json({ error: `unknown product ${it.productId}` });
      total += p.price * (it.qty || 1);
    }
    const order = { id: orders.length + 1, items, total, createdAt: new Date().toISOString() };
    orders.push(order);
    ordersTotal.inc();
    res.status(201).json(order);
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));
  return app;
}
module.exports = { createApp };
