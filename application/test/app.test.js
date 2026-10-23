const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

let server, base;
test.before(async () => {
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test('health endpoint', async () => {
  const r = await fetch(`${base}/health`);
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(await r.json(), { status: 'ok' });
});
test('lists products', async () => {
  const body = await (await fetch(`${base}/api/products`)).json();
  assert.ok(body.length >= 1);
});
test('creates order and totals correctly', async () => {
  const r = await fetch(`${base}/api/orders`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: 1, qty: 2 }] }) });
  assert.strictEqual(r.status, 201);
  assert.strictEqual((await r.json()).total, 1598);
});
test('rejects empty order', async () => {
  const r = await fetch(`${base}/api/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.strictEqual(r.status, 400);
});
test('exposes prometheus metrics', async () => {
  const txt = await (await fetch(`${base}/metrics`)).text();
  assert.match(txt, /http_request_duration_seconds/);
});
