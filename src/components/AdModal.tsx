import React, { useRef, useEffect } from 'react';
import { Ad } from '../types';
import { X, Share2, Copy, Mail, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface AdModalProps {
  ad: Ad | null;
  onClose: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ ad, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const handleCopyLink = async () => {
    if (ad?.adLink) {
      try {
        await navigator.clipboard.writeText(ad.adLink);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleShare = async () => {
    if (ad?.adLink) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${ad.format} Format Preview`,
            text: `Check out this ${ad.format} format`,
            url: ad.adLink
          });
        } else {
          throw new Error('Share not supported');
        }
      } catch (err) {
        if (err instanceof Error && err.message !== 'Share not supported') {
          toast.error('Failed to share');
        }
      }
    }
  };

  const handleEmail = () => {
    if (ad?.adLink) {
      const subject = encodeURIComponent(`${ad.format} Format Preview`);
      const body = encodeURIComponent(`Check out this ${ad.format} format: ${ad.adLink}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <Toaster position="top-center" />
      <div 
        ref={modalRef}
        className="bg-white w-[90%] h-[90vh] rounded-lg overflow-hidden shadow-xl flex animate-in zoom-in-95 duration-200 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Left Column - Format Details (30%) */}
        <div className="w-[30%] flex flex-col border-r border-gray-200">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Format Information */}
              <div>
                <h3 className="text-2xl font-bold text-[#273747] mb-2">{ad.format}</h3>
                {ad.formatDescription && (
                  <p className="text-[#273747]/80 text-sm leading-relaxed">
                    {ad.formatDescription}
                  </p>
                )}
              </div>

              <div>
                <span className="text-sm font-semibold text-[#273747]/60">Industry</span>
                <p className="text-[#273747] mt-1">{ad.industry || 'Not specified'}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#273747]/60 uppercase mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {ad.featureFlags.length > 0 ? (
                    ad.featureFlags.map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-[#4D8400]/10 text-[#4D8400] text-sm px-3 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))
                  ) : (
                    <p className="text-[#273747]/60 italic">No features specified</p>
                  )}
                </div>
              </div>

              {ad.specs && (
                <div>
                  <a 
                    href={ad.specs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#4D8400] hover:text-[#3d6a00] transition-colors"
                  >
                    <FileText size={18} />
                    <span>View Specs</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {ad.adLink && (
            <div className="border-t border-gray-200 p-4 space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#273747] px-4 py-2 rounded-lg transition-colors"
              >
                <Copy size={18} />
                Copy Link
              </button>
              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#273747] px-4 py-2 rounded-lg transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
              <button
                onClick={handleEmail}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#273747] px-4 py-2 rounded-lg transition-colors"
              >
                <Mail size={18} />
                Email
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Ad Preview (70%) */}
        <div className="w-[70%] bg-gray-100">
          {ad.adLink ? (
            <iframe
              src={ad.adLink}
              className="w-full h-full border-0"
              title={`${ad.format} format preview`}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-[#273747]/60">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdModal;