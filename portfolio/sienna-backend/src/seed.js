const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FacilityGroup = require('./models/FacilityGroup');
const Room = require('./models/Room');

dotenv.config();

const facilityGroups = [
  { title: 'Popular Facilities', iconName: 'PiDoorLight', items: ['Free parking','Free WiFi','Non-smoking rooms','24-hour front desk','Room service','Facilities for disabled guests','Airport shuttle'], order: 1 },
  { title: 'Bathroom Amenities', iconName: 'PiBathtub', items: ['Towels','Toilet paper','Toilet','Free toiletries','Hairdryer','Shower','Private bathroom'], order: 2 },
  { title: 'Bedroom Comforts', iconName: 'PiBed', items: ['Wardrobe or closet'], order: 3 },
  { title: 'Scenic Views', iconName: 'PiMountains', items: ['Mountain view','Garden view'], order: 4 },
  { title: 'Outdoor Spaces', iconName: 'PiFlowerLotus', items: ['Terrace','Garden'], order: 5 }
];

// Sample rooms
const sampleRooms = [
  {
    type: 'double',
    title: 'Double Room with Garden View',
    price: '$ 15/night',
    details: '12 m² | 1-3 guests | Free WIFI'
  },
  {
    type: 'shared',
    title: 'Family Room with Shared Bathroom',
    price: '$ 15/night',
    details: '12 m² | 1-3 guests | Free WIFI'
  },
  {
    type: 'Twin',
    title: 'Double or Twin Room with Shared Bathroom',
    price: '$ 15/night',
    details: '12 m² | 1-3 guests | Free WIFI'
  }
];

async function connectWithRetry(maxAttempts = 5) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('[Seed] MongoDB connected successfully');
      return;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw err;
      }
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
      console.log(`[Seed] Connection attempt ${attempts} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function seedData() {
  try {
    await connectWithRetry();

    // Seed facilities
    try {
      await FacilityGroup.insertMany(facilityGroups);
      console.log('✓ Facilities seeded');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✓ Facilities already exist');
      } else {
        throw err;
      }
    }

    // Seed rooms
    try {
      await Room.insertMany(sampleRooms);
      console.log('✓ Rooms seeded');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✓ Rooms already exist');
      } else {
        throw err;
      }
    }

    console.log('✓ All data seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
