import React from 'react';

interface DirectoryFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxCapacity?: number;
}

export const DirectoryFullModal: React.FC<DirectoryFullModalProps> = ({
  isOpen,
  onClose,
  maxCapacity = 650,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#130d22] border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative">
        
        {/* Large Exclamation Mark Icon */}
        <div className="w-16 h-16 rounded-full bg-[#ff5b5b] text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
          !
        </div>

        {/* Heading */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Directory Full
        </h3>

        {/* Body Description */}
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium px-2">
          The directory has reached its maximum capacity of {maxCapacity.toLocaleString()} contacts. No more contacts can be added.
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-3 rounded-2xl bg-[#f05656] hover:bg-[#e04545] text-white font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
