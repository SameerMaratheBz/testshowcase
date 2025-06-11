import React from 'react';
import { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onClick: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 transition-transform"
      onClick={() => onClick(ad)}
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {ad.thumbnail ? (
          <img 
            src={ad.thumbnail} 
            alt={`${ad.brand} ad thumbnail`} 
            className={`w-full h-full ${ad.device === 'Mobile' ? 'object-contain' : 'object-cover'}`}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-[#273747]">No thumbnail</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-[#273747] mb-1 truncate">{ad.format || 'Unknown'}</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium bg-[#6B75AA]/10 text-[#6B75AA] px-2.5 py-0.5 rounded-full">
              {ad.industry || 'Unknown Industry'}
            </span>
            <span className="text-xs text-[#273747]/70">
              {parseInt(ad.impressions || '0').toLocaleString()} views
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {ad.featureFlags.map((feature, index) => (
              <span 
                key={index}
                className="text-xs bg-[#4D8400]/10 text-[#4D8400] px-2 py-0.5 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
