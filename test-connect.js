const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    // Remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });
}

const envPath = path.resolve(__dirname, '.env');
loadEnv(envPath);

console.log('Using connection values:');
console.log('HOST=', process.env.DB_HOST);
console.log('PORT=', process.env.DB_PORT);
console.log('NAME=', process.env.DB_NAME);
console.log('USER=', process.env.DB_USERNAME);
// Do not print the password in logs

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

client.connect()
  .then(() => {
    console.log('Connected OK');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('Postgres version:', res.rows[0].version);
    return client.end();
  })
  .catch(err => {
    console.error('Connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
