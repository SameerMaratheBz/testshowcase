import axios from 'axios';
import { Ad } from '../types';

const API_URL = 'http://localhost:3001/api';

export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const response = await axios.get(`${API_URL}/ads`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch ads');
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};

export const searchWithAI = async (query: string): Promise<Ad[]> => {
  try {
    const response = await axios.post(`${API_URL}/search`, { query });
    if (response.data.success) {
      return response.data.results;
    }
    throw new Error('Failed to perform AI search');
  } catch (error) {
    console.error('Error in AI search:', error);
    throw error;
  }
};

export const refreshAds = async (): Promise<{ count: number }> => {
  try {
    const response = await axios.post(`${API_URL}/refresh`);
    if (response.data.success) {
      return { count: response.data.count };
    }
    throw new Error('Failed to refresh ads');
  } catch (error) {
    console.error('Error refreshing ads:', error);
    throw error;
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/clear-cache`);
    if (!response.data.success) {
      throw new Error('Failed to clear cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};
