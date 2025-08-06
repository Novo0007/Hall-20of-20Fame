import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Country, countries, getPopularCountries, searchCountries, detectUserCountry } from '../lib/countries';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountrySelect: (country: Country) => void;
  autoDetect?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  selectedCountry, 
  onCountrySelect, 
  autoDetect = true 
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect country on mount
  useEffect(() => {
    if (autoDetect && !selectedCountry) {
      detectCountryAutomatically();
    }
  }, [autoDetect, selectedCountry]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const detectCountryAutomatically = async () => {
    setIsDetecting(true);
    try {
      const detectedCountry = await detectUserCountry();
      if (detectedCountry) {
        onCountrySelect(detectedCountry);
      }
    } catch (error) {
      console.error('Failed to detect country:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredCountries = searchQuery 
    ? searchCountries(searchQuery)
    : countries;

  const popularCountries = getPopularCountries();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Country Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 w-full ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-slate-200 hover:bg-gray-600'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        {isDetecting ? (
          <>
            <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm">Detecting...</span>
          </>
        ) : selectedCountry ? (
          <>
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium truncate">{selectedCountry.name}</span>
          </>
        ) : (
          <>
            <span className="text-lg">🌍</span>
            <span className="text-sm text-slate-500">Select Country</span>
          </>
        )}
        <span className="ml-auto text-slate-400">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 max-h-80 overflow-hidden ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-slate-200'
        }`}>
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries..."
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-slate-200 placeholder-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-500'
              }`}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Auto-detect option */}
            {!selectedCountry && (
              <button
                onClick={detectCountryAutomatically}
                disabled={isDetecting}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <span className="text-lg">🔍</span>
                <div>
                  <div className="text-sm font-medium">Auto-detect my country</div>
                  <div className="text-xs text-slate-500">Uses your IP location</div>
                </div>
              </button>
            )}

            {/* Popular Countries */}
            {!searchQuery && (
              <>
                <div className={`px-3 py-2 text-xs font-medium border-b ${
                  isDark 
                    ? 'text-slate-400 border-gray-700' 
                    : 'text-slate-500 border-slate-200'
                }`}>
                  Popular Countries
                </div>
                {popularCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors ${
                      selectedCountry?.code === country.code
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-gray-700'
                    } ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                  </button>
                ))}
              </>
            )}

            {/* All Countries */}
            <div className={`px-3 py-2 text-xs font-medium border-b ${
              isDark 
                ? 'text-slate-400 border-gray-700' 
                : 'text-slate-500 border-slate-200'
            }`}>
              {searchQuery ? `Search Results (${filteredCountries.length})` : 'All Countries'}
            </div>
            
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                No countries found for "{searchQuery}"
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors ${
                    selectedCountry?.code === country.code
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-700'
                  } ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
