import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ad, SearchFilters, SortConfig } from '../types';
import { fetchAds, searchWithAI } from '../services/api';

interface AdContextProps {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  selectedAd: Ad | null;
  filteredAds: Ad[];
  visibleAds: Ad[];
  searchFilters: SearchFilters;
  sortConfig: SortConfig;
  setSearchFilters: (filters: SearchFilters) => void;
  setSortConfig: (config: SortConfig) => void;
  selectAd: (ad: Ad | null) => void;
  refreshAds: () => Promise<void>;
  uniqueIndustries: string[];
  uniqueFormats: string[];
  uniqueFeatures: string[];
  loadMoreAds: () => void;
  setAIQuery: (query: string) => void;
  selectedAccounts: string[];
  setSelectedAccounts: (accounts: string[]) => void;
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
}

const initialSearchFilters: SearchFilters = {
  search: '',
  industry: '',
  format: '',
  features: '',
};

const initialSortConfig: SortConfig = {
  field: 'impressions',
  direction: 'desc'
};

const ITEMS_PER_PAGE = 12;

const AdContext = createContext<AdContextProps | undefined>(undefined);

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(initialSearchFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [aiResults, setAiResults] = useState<Ad[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const loadAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAds();
      setAds(data);
      setAiResults([]);
    } catch (err) {
      setError('Failed to load ads. Please try again later.');
      console.error('Error loading ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const refreshAds = async () => {
    await loadAds();
  };

  const selectAd = (ad: Ad | null) => {
    setSelectedAd(ad);
  };

  const setAIQuery = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchWithAI(query);
      setAiResults(results);
      // Don't reset search filters to allow combining AI results with regular filters
    } catch (err) {
      setError('Failed to process AI search. Please try again.');
      console.error('Error in AI search:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueIndustries = [...new Set(ads.map(ad => ad.industry))].filter(Boolean).sort();
  const uniqueFormats = [...new Set(ads.map(ad => ad.format))].filter(Boolean).sort();
  const uniqueFeatures = [...new Set(ads.flatMap(ad => ad.featureFlags))].filter(Boolean).sort();

  const filteredAds = (aiResults.length > 0 ? aiResults : ads)
    .filter(ad => {
      // First apply account filtering
      const accountMatches = selectedAccounts.length === 0 || 
        selectedAccounts.includes('all') || 
        (ad.account && selectedAccounts.includes(ad.account));

      if (!accountMatches) return false;

      // Apply format filtering from URL parameters (admin-generated filters)
      const urlFormatMatches = selectedFormats.length === 0 || 
        (ad.format && selectedFormats.includes(ad.format));

      if (!urlFormatMatches) return false;

      // Then apply search filters
      const searchFields = [
        ad.account,
        ad.brand,
        ad.industry,
        ad.campaign,
        ad.creative_name,
        ad.format,
        ad.template,
        ad.features
      ];

      const matchesSearch = searchFilters.search 
        ? searchFields.some(field => 
            field && field.toLowerCase().includes(searchFilters.search.toLowerCase())
          )
        : true;
      
      const matchesIndustry = searchFilters.industry 
        ? ad.industry === searchFilters.industry
        : true;
      
      // For user-selected format filter, only apply if no admin format filters are active
      const matchesFormat = searchFilters.format && selectedFormats.length === 0
        ? ad.format === searchFilters.format
        : true;
      
      const matchesFeatures = searchFilters.features 
        ? ad.featureFlags.includes(searchFilters.features)
        : true;

      return matchesSearch && matchesIndustry && matchesFormat && matchesFeatures;
    })
    .sort((a, b) => {
      if (sortConfig.field === 'impressions') {
        const aValue = parseInt(a.impressions || '0');
        const bValue = parseInt(b.impressions || '0');
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aValue = (a[sortConfig.field] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.field] || '').toString().toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchFilters, sortConfig, aiResults, selectedAccounts, selectedFormats]);

  const visibleAds = filteredAds.slice(0, visibleCount);

  const loadMoreAds = () => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredAds.length));
  };

  return (
    <AdContext.Provider value={{
      ads,
      loading,
      error,
      selectedAd,
      filteredAds,
      visibleAds,
      searchFilters,
      sortConfig,
      setSearchFilters,
      setSortConfig,
      selectAd,
      refreshAds,
      uniqueIndustries,
      uniqueFormats,
      uniqueFeatures,
      loadMoreAds,
      setAIQuery,
      selectedAccounts,
      setSelectedAccounts,
      selectedFormats,
      setSelectedFormats,
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAdContext must be used within an AdProvider');
  }
  return context;
};