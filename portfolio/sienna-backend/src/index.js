const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env file in the sienna-backend directory with the required variables.');
  console.error('See .env.example for a template.');
  process.exit(1);
}

const facilitiesRoutes = require('./routes/facilities');
const usersRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/facilities', facilitiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rooms', roomsRoutes);

const PORT = process.env.PORT || 5000;

// Improve connection options and error logging for easier debugging
const mongooseOptions = {
  // Modern MongoDB driver no longer needs useNewUrlParser/useUnifiedTopology
  serverSelectionTimeoutMS: 10000, // 10s timeout for quicker failure when network blocked
};

function maskUri(u) {
  if (!u) return u;
  try {
    return u.replace(/:(?:[^@]+)@/, ':<password>@');
  } catch (e) {
    return '<unable to mask uri>';
  }
}

// Reconnection logic with exponential backoff
let connectionAttempts = 0;
const maxAttempts = 10;
const baseDelay = 2000; // 2 seconds

async function connectToMongoDB() {
  connectionAttempts++;
  const delay = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), 60000); // Max 60 seconds

  console.log(`[${new Date().toISOString()}] MongoDB connection attempt ${connectionAttempts}/${maxAttempts}`);
  console.log('Attempting MongoDB connection using MONGO_URI:', maskUri(process.env.MONGO_URI));

  try {
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log(`[${new Date().toISOString()}] MongoDB connected successfully`);
    connectionAttempts = 0; // Reset on success
    
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] MongoDB connection failed (attempt ${connectionAttempts}/${maxAttempts}):`);
    console.error(err.message);

    if (connectionAttempts < maxAttempts) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      setTimeout(connectToMongoDB, delay);
    } else {
      console.error(`[${new Date().toISOString()}] Max connection attempts reached. Exiting.`);
      process.exit(1);
    }
  }
}

connectToMongoDB();
