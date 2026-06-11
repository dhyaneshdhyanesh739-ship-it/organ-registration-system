import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader, ChevronRight, Check } from 'lucide-react';
import { locationService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

const LocationPicker = ({ onSelect, initialValue = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialValue);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      handleSearch();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await locationService.searchVillages(searchTerm);
      if (data && data.villages) {
        // Limit to 10 suggestions for performance
        setSuggestions(data.villages.slice(0, 10));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (village) => {
    const location = {
      village: village.name,
      taluka: village.taluka,
      district: village.district,
      state: village.state,
      // Since India Location Hub might not provide Pincodes directly in the village object
      // (sometimes they do, sometimes not), I'll set it if available or leave it for the user
      pincode: village.pincode || '', 
    };
    
    setSelectedLocation(location);
    setSearchTerm(`${village.name}, ${village.district}, ${village.state}`);
    setShowSuggestions(false);
    onSelect(location);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader className="h-5 w-5 text-primary-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          className="input-field pl-10 h-12"
          placeholder="Search your village, city or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
        />
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-80 overflow-y-auto custom-scrollbar"
          >
            {suggestions.map((v, idx) => (
              <button
                key={`${v.id}-${idx}`}
                onClick={() => handleSelect(v)}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-3 border-b last:border-0 border-gray-50 dark:border-gray-700 transition-colors"
                type="button"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white capitalize">
                    {v.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {v.taluka}, {v.district}, {v.state}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {suggestions.length === 0 && searchTerm.length > 2 && !loading && showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 text-center">
          <p className="text-gray-500">No locations found for "{searchTerm}"</p>
          <button 
            type="button"
            className="text-primary-600 font-bold mt-2 text-sm hover:underline"
            onClick={() => setShowSuggestions(false)}
          >
            Enter manually
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
