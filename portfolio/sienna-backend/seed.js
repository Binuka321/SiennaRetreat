/* Simple idempotent seed script for demo rooms
   Usage: node seed.js
   It reads MONGO_URI from .env (same as src/index.js), connects, and inserts sample rooms if none exist.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./src/models/Room');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

async function run() {
  try {
  console.log('Connecting to MongoDB...');
  // Use minimal options compatible with current driver
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected');

    const count = await Room.countDocuments();
    if (count > 0) {
      console.log(`Rooms collection already has ${count} documents - skipping seed.`);
      process.exit(0);
    }

    const now = new Date();
    const rooms = [
      {
        type: 'double',
        title: 'Double Room with Garden View',
        price: '$15/night',
        details: '12 m² | 1-3 guests | Free WIFI',
        img: '/assets/room1.jpg'
      },
      {
        type: 'shared',
        title: 'Family Room with Shared Bathroom',
        price: '$20/night',
        details: '20 m² | 2-4 guests | Free WIFI',
        img: '/assets/room2.jpg'
      },
      {
        type: 'Twin',
        title: 'Double or Twin Room with Shared Bathroom',
        price: '$18/night',
        details: '15 m² | 1-3 guests | Free WIFI',
        img: '/assets/room3.jpg'
      },
    ];

    const inserted = await Room.insertMany(rooms);
    console.log(`Inserted ${inserted.length} rooms.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

run();
