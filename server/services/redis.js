import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let client;

export function getClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    client = new Redis(redisUrl);
    
    client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  
  return client;
}

export async function cacheData(key, data, ttl = 3600) {
  const redis = getClient();
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    console.log(`Data cached with key: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Error caching data with key ${key}:`, error);
    return false;
  }
}

export async function getCachedData(key) {
  const redis = getClient();
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
}

export async function clearCache(key) {
  const redis = getClient();
  try {
    await redis.del(key);
    console.log(`Cache cleared for key: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
    return false;
  }
}