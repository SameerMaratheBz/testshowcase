import React, { useState, useEffect, useRef } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { Copy, CheckCircle, Check, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { encrypt } from '../utils/encryption';
import Header from './Header';

const AdminPage: React.FC = () => {
  const { ads } = useAdContext();
  const [uniqueAccounts, setUniqueAccounts] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accounts = ['all', ...new Set(ads.map(ad => ad.account))].filter(Boolean).sort();
    setUniqueAccounts(accounts);
  }, [ads]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountToggle = (account: string) => {
    if (account === 'all') {
      setSelectedAccounts(['all']);
      return;
    }

    setSelectedAccounts(prev => {
      const withoutAll = prev.filter(a => a !== 'all');
      
      if (prev.includes(account)) {
        return withoutAll.filter(a => a !== account);
      } else {
        return [...withoutAll, account];
      }
    });
  };

  const generateShareableUrl = () => {
    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    const baseUrl = window.location.origin;
    const encryptedParams = encrypt(selectedAccounts.join(','));
    const encodedParams = encodeURIComponent(encryptedParams);
    const url = `${baseUrl}/showcase/${encodedParams}`;
    setShareableUrl(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const filteredAccounts = uniqueAccounts.filter(account => 
    account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account === 'all' && searchTerm.toLowerCase().includes('all'))
  );

  const getFilteredAdsCount = () => {
    return ads.filter(ad => {
      const accountMatches = selectedAccounts.includes('all') || 
        (ad.account && selectedAccounts.includes(ad.account));
      return accountMatches;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Toaster position="top-right" />
      
      <main className="flex-1 container mx-auto px-4 py-6 mt-[70px]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            <div className="space-y-6">
              {/* Account Selection */}
              <div className="relative" ref={accountDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Accounts
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center"
                  >
                    <span className="truncate">
                      {selectedAccounts.length === 0 
                        ? 'Select accounts...'
                        : selectedAccounts.includes('all')
                          ? 'All Accounts'
                          : `${selectedAccounts.length} account(s) selected`}
                    </span>
                    <span className="ml-2">▼</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d8400] focus:border-transparent text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-auto">
                        {filteredAccounts.map((account) => (
                          <div
                            key={account}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAccountToggle(account)}
                          >
                            <div className="w-5 h-5 border border-gray-300 rounded mr-3 flex items-center justify-center">
                              {(account === 'all' ? selectedAccounts.includes('all') : selectedAccounts.includes(account)) && (
                                <Check size={16} className="text-[#4d8400]" />
                              )}
                            </div>
                            <span>{account === 'all' ? 'All Accounts' : account}</span>
                          </div>
                        ))}
                        {filteredAccounts.length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No accounts found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview count */}
              {selectedAccounts.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected ads: {getFilteredAdsCount()}
                </div>
              )}

              <button
                onClick={generateShareableUrl}
                className="w-full bg-[#4d8400] hover:bg-[#3d6a00] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generate Shareable URL
              </button>

              {shareableUrl && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 break-all mr-4">{shareableUrl}</p>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-[#4d8400] hover:text-[#3d6a00]"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#4d8400] mt-1" />
                    <span>Use the search box to quickly find specific accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#4d8400] mt-1" />
                    <span>Check multiple accounts to include them in the showcase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#4d8400] mt-1" />
                    <span>Select "All" to include all accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#4d8400] mt-1" />
                    <span>Click "Generate Shareable URL" to create a unique link</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;