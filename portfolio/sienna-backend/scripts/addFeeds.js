#!/usr/bin/env node
// Usage: node scripts/addFeeds.js --token <ADMIN_TOKEN> feeds.json
const fs = require('fs');
const { URL } = require('url');
const http = require('http');
const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { token: null, file: null, host: 'http://localhost:5000' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--token' || a === '-t') && args[i+1]) {
      out.token = args[++i];
    } else if ((a === '--host' || a === '-h') && args[i+1]) {
      out.host = args[++i];
    } else if (!out.file) {
      out.file = a;
    }
  }
  return out;
}

function postJson(urlString, token, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;
    const payload = JSON.stringify(data);

    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };

    const req = lib.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject({ status: res.statusCode, body: parsed });
        } catch (e) {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve({ raw: body });
          else reject({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const opts = parseArgs();
  if (!opts.file || !opts.token) {
    console.error('Usage: node scripts/addFeeds.js --token <ADMIN_TOKEN> feeds.json [--host http://localhost:5000]');
    process.exit(1);
  }

  let feeds;
  try {
    feeds = JSON.parse(fs.readFileSync(opts.file, 'utf8'));
  } catch (e) {
    console.error('Could not read feeds file:', e.message);
    process.exit(1);
  }

  for (const f of feeds) {
    try {
      const apiUrl = opts.host.replace(/\/$/, '') + '/api/calendars';
      const res = await postJson(apiUrl, opts.token, f);
      console.log('Added feed:', res._id || res.id || JSON.stringify(res));
    } catch (err) {
      console.error('Failed to add feed', f.name || f.url, err);
    }
  }
}

main();
