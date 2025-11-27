const express = require('express');
const app = express();
app.get('/ping', (req, res) => res.json({ ok: true, pid: process.pid }));
const p = process.env.PORT || 5001;
app.listen(p, '127.0.0.1', () => console.log('Test server listening on', p));
setTimeout(()=>console.log('still alive'), 60000);