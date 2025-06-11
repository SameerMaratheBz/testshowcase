import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import { fetchAndCacheAds } from './services/googleSheets.js';
import { getClient } from './services/redis.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Redis client
const redisClient = getClient();

// Routes
app.use('/api', apiRoutes);

// Initial data fetch
console.log('Performing initial data fetch from Google Sheets...');
fetchAndCacheAds()
  .then(() => console.log('Initial data fetch completed and cached'))
  .catch(err => console.error('Initial data fetch failed:', err));

// Schedule periodic refresh
const refreshInterval = parseInt(process.env.REFRESH_INTERVAL) || 600; // Default to 10 minutes
schedule.scheduleJob(`*/${refreshInterval} * * * *`, async () => {
  console.log('Running scheduled data refresh...');
  try {
    await fetchAndCacheAds();
    console.log('Scheduled data refresh completed');
  } catch (err) {
    console.error('Scheduled data refresh failed:', err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await redisClient.quit();
  process.exit(0);
});