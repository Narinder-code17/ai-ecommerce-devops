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
    name: 'orders_created_total',
    help: 'Orders created',
    registers: [register],
  });

  const products = [
    { id: 1, name: 'Wireless Mouse', price: 799 },
    { id: 2, name: 'Mechanical Keyboard', price: 3499 },
    { id: 3, name: 'USB-C Hub', price: 1999 },
    { id: 4, name: 'Laptop Stand', price: 1299 },
  ];

  const orders = [];

  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const sec = Number(process.hrtime.bigint() - start) / 1e9;
      const route = req.route ? req.route.path : req.path;

      httpDuration
        .labels(req.method, route, String(res.statusCode))
        .observe(sec);

      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: res.statusCode >= 500 ? 'error' : 'info',
        msg: 'request',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration_ms: Math.round(sec * 1000),
      }));
    });

    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/ready', async (_req, res) => {
    if (pool) {
      try {
        await pool.query('SELECT 1');
      } catch (e) {
        console.log(JSON.stringify({
          ts: new Date().toISOString(),
          level: 'error',
          msg: 'database connection timeout',
          error: e.message,
        }));

        return res.status(503).json({ status: 'db-unavailable' });
      }
    }

    res.json({ status: 'ready' });
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.get('/api/products', (_req, res) => {
    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = products.find(
      (item) => item.id === Number(req.params.id)
    );

    return product
      ? res.json(product)
      : res.status(404).json({ error: 'not found' });
  });

  // Create the orders table when PostgreSQL is configured.
  const initializeDatabase = pool
    ? pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          items JSONB NOT NULL,
          total INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
    : Promise.resolve();

  app.post('/api/orders', async (req, res) => {
    try {
      await initializeDatabase;

      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items required' });
      }

      let total = 0;

      for (const item of items) {
        const product = products.find(
          (p) => p.id === Number(item.productId)
        );

        const qty = Number(item.qty ?? 1);

        if (!product) {
          return res.status(400).json({
            error: `unknown product ${item.productId}`,
          });
        }

        if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
          return res.status(400).json({
            error: 'quantity must be an integer between 1 and 100',
          });
        }

        total += product.price * qty;
      }

      let order;

      if (pool) {
        const result = await pool.query(
          `INSERT INTO orders (items, total)
           VALUES ($1::jsonb, $2)
           RETURNING id, items, total, created_at AS "createdAt"`,
          [JSON.stringify(items), total]
        );

        order = result.rows[0];
      } else {
        order = {
          id: orders.length + 1,
          items,
          total,
          createdAt: new Date().toISOString(),
        };

        orders.push(order);
      }

      ordersTotal.inc();
      return res.status(201).json(order);
    } catch (error) {
      console.error('Order creation failed:', error.message);

      return res.status(500).json({
        error: 'Unable to create order',
      });
    }
  });

  // List orders to support database verification.
  app.get('/api/orders', async (_req, res) => {
    try {
      await initializeDatabase;

      if (pool) {
        const result = await pool.query(
          `SELECT id, items, total, created_at AS "createdAt"
           FROM orders
           ORDER BY id DESC
           LIMIT 100`
        );

        return res.json(result.rows);
      }

      return res.json([...orders].reverse());
    } catch (error) {
      console.error('Order retrieval failed:', error.message);

      return res.status(500).json({
        error: 'Unable to retrieve orders',
      });
    }
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  return app;
}

module.exports = { createApp };
