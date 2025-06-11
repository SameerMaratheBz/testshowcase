import express from 'express';
import { getAds, fetchAndCacheAds } from '../services/googleSheets.js';
import { clearCache } from '../services/redis.js';
import { searchAds } from '../services/aiSearch.js';

const router = express.Router();

// Get all ads
router.get('/ads', async (req, res) => {
  try {
    const ads = await getAds();
    res.json({ success: true, data: ads });
  } catch (error) {
    console.error('Error in /api/ads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ads data' });
  }
});

// AI-powered search
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const ads = await getAds();
    const results = await searchAds(query, ads);
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error in /api/search:', error);
    res.status(500).json({ success: false, error: 'Failed to perform search' });
  }
});

// Force refresh from Google Sheets
router.post('/refresh', async (req, res) => {
  try {
    const ads = await fetchAndCacheAds();
    res.json({ success: true, message: 'Data refreshed successfully', count: ads.length });
  } catch (error) {
    console.error('Error in /api/refresh:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh ads data' });
  }
});

// Clear cache
router.post('/clear-cache', async (req, res) => {
  try {
    await clearCache('ads_data');
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error in /api/clear-cache:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
});

export default router;
