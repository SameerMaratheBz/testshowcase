import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
import { cacheData, getCachedData } from './redis.js';
import { setupVectorIndex, storeAdVectors } from './embeddings.js';
import fs from 'fs';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CACHE_KEY = 'ads_data';
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600; // Default to 1 hour
const IMAGE_BASE_URL = 'https://dev-mizu-adcreator.s3.ap-south-1.amazonaws.com/dev-asset/';

const FEATURE_COLUMNS = [
  'button', 'hotspot', 'fire', 'objthreesixty', 'photosphere', 'feed_carousel',
  'fog', 'puzzle', 'cloud', 'wipey', 'group', 'checkbox', 'text', 'feature',
  'nearbyele', 'dd', 'sun', 'advanced_gallery', 'gallery', 'map', 'confetti',
  'shape', 'video', 'countdown', 'rain', 'socialdisplay', 'snow', 'waterbubble',
  'image', 'smoke', 'nightstar', 'textbox', 'form'
];

export async function fetchAndCacheAds() {
  try {
    console.log('Fetching data from Google Sheets...');
    const doc = new GoogleSpreadsheet(SHEET_ID);
    const creds = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8')
    );
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    
    // Load both sheets
    const adsSheet = doc.sheetsByIndex[0];
    const formatsSheet = doc.sheetsByIndex[1];
    
    await Promise.all([
      adsSheet.loadCells(),
      formatsSheet.loadCells()
    ]);
    
    // Get format descriptions and specs
    const formatRows = await formatsSheet.getRows();
    const formatInfo = new Map(
      formatRows.map(row => [row['format'], {
        description: row['description'],
        specs: row['specs']
      }])
    );
    
    const rows = await adsSheet.getRows();
    
    const ads = rows.map((row, index) => {
      const screenshotPath = row['screenshot_path'] || '';
      
      // Extract active features
      const activeFeatures = FEATURE_COLUMNS
        .filter(feature => row[feature]?.toLowerCase() === 'yes')
        .map(feature => feature.replace('_', ' '));

      const format = row['format'] || '';
      const formatData = formatInfo.get(format) || {};

      return {
        id: index + 1,
        account: row['account'] || '',
        brand: row['brand'] || '',
        industry: row['industry'] || '',
        campaign: row['campaign'] || '',
        creative_id: row['creative_id'] || '',
        creative_name: row['creative_name'] || '',
        device: row['device'] || '',
        format,
        formatDescription: formatData.description || '',
        specs: formatData.specs || '',
        template: row['template'] || '',
        adLink: row['previewurl'] || '',
        impressions: row['impressions'] || '',
        clicks: row['clicks'] || '',
        filtered_click: row['filtered click'] || '',
        engagement: row['engagement'] || '',
        features: activeFeatures.join(','),
        first_impression_date: row['first impression date'] || '',
        universal_interaction_rate: row['universal interaction rate'] || '',
        filterctr: row['filterctr'] || '',
        thumbnail: screenshotPath ? `${IMAGE_BASE_URL}${screenshotPath}` : '',
        featureFlags: activeFeatures
      };
    });
    
    await cacheData(CACHE_KEY, ads, CACHE_TTL);
    console.log(`Cached ${ads.length} ads from Google Sheets`);
    console.log(`----> ${JSON.stringify(ads)}`);

    // Set up vector search and store embeddings
    await setupVectorIndex();
    await storeAdVectors(ads);
    
    return ads;
  } catch (error) {
    console.error('Error fetching ads from Google Sheets:', error);
    throw error;
  }
}

export async function getAds() {
  try {
    const cachedAds = await getCachedData(CACHE_KEY);
    
    if (cachedAds) {
      console.log('Serving ads from cache');
      return cachedAds;
    }
    
    console.log('Cache miss, fetching from Google Sheets');
    return await fetchAndCacheAds();
  } catch (error) {
    console.error('Error getting ads:', error);
    throw error;
  }
}