import React, { useState, useEffect } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { Sparkles, Share2, Copy, Check } from 'lucide-react';
import { SortField } from '../types';
import { encrypt } from '../utils/encryption';
import toast, { Toaster } from 'react-hot-toast';

const SearchBar: React.FC = () => {
  const { 
    searchFilters, 
    setSearchFilters, 
    uniqueIndustries,
    uniqueFormats,
    uniqueFeatures,
    setAIQuery,
    selectedFormats,
    filteredAds,
    ads
  } = useAdContext();

  const [aiPrompt, setAiPrompt] = useState('');
  const [shareableUrl, setShareableUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Check if we have admin-applied format filters from URL
  const hasAdminFormatFilters = selectedFormats.length > 0;

  // Set AI prompt from URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const aiQueryParam = urlParams.get('ai_query');
    if (aiQueryParam) {
      setAiPrompt(decodeURIComponent(aiQueryParam));
    }
  }, []);

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiPrompt(e.target.value);
  };

  const handleAISearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      setAIQuery(aiPrompt);
    }
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchFilters({ ...searchFilters, industry: e.target.value });
  };

  const handleFormatClick = (format: string) => {
    setSearchFilters(prev => ({ 
      ...prev, 
      format: prev.format === format ? '' : format 
    }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchFilters({ ...searchFilters, features: e.target.value });
  };

  const generateShareableLink = () => {
    // Get unique accounts from filtered results
    const accountsInResults = [...new Set(filteredAds.map(ad => ad.account))].filter(Boolean);
    
    if (accountsInResults.length === 0) {
      toast.error('No results to share');
      return;
    }

    const baseUrl = window.location.origin;
    const encryptedParams = encrypt(accountsInResults.join(','));
    const encodedParams = encodeURIComponent(encryptedParams);
    
    let url = `${baseUrl}/showcase/${encodedParams}`;
    
    // Build query parameters for filters
    const queryParams = new URLSearchParams();
    
    // Add format filters (both admin-applied and user-selected)
    const allFormatFilters = [];
    if (selectedFormats.length > 0) {
      allFormatFilters.push(...selectedFormats);
    }
    if (searchFilters.format) {
      allFormatFilters.push(searchFilters.format);
    }
    
    if (allFormatFilters.length > 0) {
      queryParams.set('formats', allFormatFilters.join(','));
    }
    
    // Add other filters
    if (searchFilters.industry) {
      queryParams.set('industry', searchFilters.industry);
    }
    
    if (searchFilters.features) {
      queryParams.set('features', searchFilters.features);
    }
    
    // Add AI query if it was used
    if (aiPrompt.trim()) {
      queryParams.set('ai_query', aiPrompt.trim());
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    setShareableUrl(url);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const hasActiveFilters = searchFilters.industry || searchFilters.format || searchFilters.features || aiPrompt.trim() || hasAdminFormatFilters;
  const resultsCount = filteredAds.length;

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="space-y-4">
          {/* AI Search */}
          <form onSubmit={handleAISearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles size={18} className="text-[#4D8400]" />
            </div>
            <input
              type="text"
              placeholder="Describe your campaign needs (e.g., 'Create a campaign for Mercedes to launch a new model')..."
              value={aiPrompt}
              onChange={handleAIPromptChange}
              className="pl-10 w-full p-3 border-2 border-[#4D8400] rounded-md focus:ring-2 focus:ring-[#4D8400] focus:border-transparent text-lg text-[#273747]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#4D8400] text-white px-4 py-1.5 rounded-md hover:bg-[#3d6a00] transition-colors"
            >
              Find Similar
            </button>
          </form>

          <div className="border-b border-gray-200 my-4"></div>

          {/* Show admin-applied format filters if any */}
          {hasAdminFormatFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-800">Applied Format Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFormats.map((format) => (
                  <span 
                    key={format}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4">
            <div className="w-64">
              <select
                value={searchFilters.industry}
                onChange={handleIndustryChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4D8400] focus:border-transparent text-[#273747]"
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-64">
              <select
                value={searchFilters.features}
                onChange={handleFeaturesChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4D8400] focus:border-transparent text-[#273747]"
              >
                <option value="">All Features</option>
                {uniqueFeatures.map((feature) => (
                  <option key={feature} value={feature}>
                    {feature}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format pills - only show if no admin format filters are applied */}
          {!hasAdminFormatFilters && (
            <div className="flex flex-wrap gap-2">
              {uniqueFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatClick(format)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    searchFilters.format === format
                      ? 'bg-[#4D8400] text-white'
                      : 'bg-gray-100 text-[#273747] hover:bg-gray-200'
                  }`}
                >
                  {format}
                </button>
              ))}
              <button
                onClick={() => handleFormatClick('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !searchFilters.format
                    ? 'bg-[#4D8400] text-white'
                    : 'bg-gray-100 text-[#273747] hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          )}

          {/* Results summary and share button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{resultsCount.toLocaleString()}</span> ads found
                {resultsCount !== ads.length && (
                  <span className="ml-1">
                    (filtered from {ads.length.toLocaleString()} total)
                  </span>
                )}
              </div>
              
              {resultsCount > 0 && (
                <button
                  onClick={generateShareableLink}
                  className="flex items-center gap-2 bg-[#4D8400] hover:bg-[#3d6a00] text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Share2 size={16} />
                  Share Results
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Search Results</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Share this link to show others your filtered results ({resultsCount} ads):
                </p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-[#4D8400] hover:text-[#3d6a00] px-2 py-1 rounded"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              {/* Show active filters summary */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                <div className="space-y-2 text-sm">
                  {aiPrompt.trim() && (
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#4D8400]" />
                      <span className="text-gray-600">AI Search:</span>
                      <span className="font-medium">"{aiPrompt.trim()}"</span>
                    </div>
                  )}
                  
                  {(selectedFormats.length > 0 || searchFilters.format) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Formats:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedFormats.map(format => (
                          <span key={format} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {format}
                          </span>
                        ))}
                        {searchFilters.format && (
                          <span className="bg-[#4D8400]/10 text-[#4D8400] px-2 py-0.5 rounded text-xs">
                            {searchFilters.format}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {searchFilters.industry && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{searchFilters.industry}</span>
                    </div>
                  )}
                  
                  {searchFilters.features && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Features:</span>
                      <span className="font-medium">{searchFilters.features}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;