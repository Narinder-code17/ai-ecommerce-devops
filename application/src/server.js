const { createApp } = require('./app');
let pool = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
}
const port = Number(process.env.PORT || 3000);
const server = createApp({ pool }).listen(port, () =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', msg: `listening on ${port}`, env: process.env.APP_ENV || 'dev' })));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
