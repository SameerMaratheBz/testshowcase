import React, { useState } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { Sparkles } from 'lucide-react';
import { SortField } from '../types';

const SearchBar: React.FC = () => {
  const { 
    searchFilters, 
    setSearchFilters, 
    uniqueIndustries,
    uniqueFormats,
    uniqueFeatures,
    setAIQuery
  } = useAdContext();

  const [aiPrompt, setAiPrompt] = useState('');

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

  return (
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

        {/* Format pills */}
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
      </div>
    </div>
  );
};

export default SearchBar;