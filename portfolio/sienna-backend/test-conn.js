const mongoose = require('mongoose');
// Load .env from this folder so the script works when run from repo root
require('dotenv').config({ path: __dirname + '/.env' });

const uri = process.env.MONGO_URI;

function maskUri(u) {
  if (!u) return u;
  try {
    return u.replace(/:(?:[^@]+)@/, ':<password>@');
  } catch (e) {
    return '<unable to mask uri>';
  }
}

console.log('Attempting MongoDB connection using MONGO_URI:', maskUri(uri));

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('Connected OK');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection failed with error:');
    console.error(err);
    process.exit(1);
  });
