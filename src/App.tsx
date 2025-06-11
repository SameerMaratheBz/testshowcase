import React, { useRef, useEffect } from 'react';
import { AdProvider } from './contexts/AdContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AdCard from './components/AdCard';
import AdModal from './components/AdModal';
import AdminPage from './components/AdminPage';
import { useAdContext } from './contexts/AdContext';
import { decrypt } from './utils/encryption';

const AdShowcase: React.FC = () => {
  const { 
    visibleAds, 
    loading, 
    error, 
    selectAd, 
    selectedAd,
    loadMoreAds,
    filteredAds,
    setSelectedAccounts,
    setSelectedFormats
  } = useAdContext();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we're on a showcase URL
    const path = window.location.pathname;
    const match = path.match(/^\/showcase\/(.+)$/);
    if (match) {
      try {
        const encryptedAccounts = decodeURIComponent(match[1]);
        const accounts = decrypt(encryptedAccounts).split(',');
        setSelectedAccounts(accounts);

        // Check for format filters in query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const formatsParam = urlParams.get('formats');
        if (formatsParam) {
          const formats = decodeURIComponent(formatsParam).split(',');
          setSelectedFormats(formats);
        }
      } catch (error) {
        console.error('Failed to decrypt account parameter');
        // Handle invalid URLs gracefully
        window.location.href = '/';
      }
    }
  }, [setSelectedAccounts, setSelectedFormats]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && visibleAds.length < filteredAds.length && !loading) {
        loadMoreAds();
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreAds, visibleAds.length, filteredAds.length, loading]);

  // Check if we're on the admin page
  const isAdminPage = window.location.pathname === '/admin';
  if (isAdminPage) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 mt-[70px]">
        <SearchBar />
        
        {loading && visibleAds.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {!loading && !error && visibleAds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No ads found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {visibleAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} onClick={selectAd} />
          ))}
        </div>

        {visibleAds.length < filteredAds.length && (
          <div 
            ref={loadingRef}
            className="flex justify-center items-center py-8"
          >
            {loading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            )}
          </div>
        )}
      </main>
      
      {selectedAd && <AdModal ad={selectedAd} onClose={() => selectAd(null)} />}
    </div>
  );
};

function App() {
  return (
    <AdProvider>
      <AdShowcase />
    </AdProvider>
  );
}

export default App;