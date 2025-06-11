import React, { useState, useEffect } from 'react';
import { useAdContext } from '../contexts/AdContext';
import { RefreshCw } from 'lucide-react';

const Header: React.FC = () => {
  const { refreshAds, loading } = useAdContext();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRefresh = async () => {
    await refreshAds();
  };

  return (
    <header 
      className={`bg-white h-[70px] fixed top-0 left-0 right-0 z-40 transition-shadow duration-200 ${
        isScrolled ? 'shadow-[0_1px_10px_0px_#aaa]' : ''
      }`}
    >
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/bonzai_logo_new.png" 
            alt="Bonzai Logo" 
            className="h-[30px]"
          />
          {/* <h1 className="text-2xl md:text-3xl font-bold text-[#273747]">Ad Showcase</h1> */}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-[#4D8400] hover:bg-[#3d6a00] text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Refresh Data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;