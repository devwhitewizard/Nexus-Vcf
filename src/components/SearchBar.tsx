import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5 pointer-events-none" />
      <input
        type="text"
        placeholder="Search contacts by name, phone number, country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-3 text-gray-400 hover:text-white"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
