import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { loadStationData, getCachedStationData, type Station } from '@/utils/stationDataLoader';

interface StationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  onReset?: () => void;
}

export const StationAutocomplete = ({
  value,
  onChange,
  placeholder = "Search station...",
  error,
  label,
  required = false,
  onReset
}: StationAutocompleteProps) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Load stations using centralized loader (cached globally)
  useEffect(() => {
    const loadStations = async () => {
      try {
        // Check if data is already cached
        const cachedData = getCachedStationData();
        if (cachedData) {
          // Data already loaded, use it immediately (no loading state)
          setStations(cachedData);
          setIsLoading(false);
          return;
        }

        // Data not cached, need to load
        setIsLoading(true);
        setLoadError(null);
        
        const stationData = await loadStationData();
        setStations(stationData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading stations:', error);
        setLoadError('Could not load station data');
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  // Update input value when prop value changes (for reset functionality)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter stations based on input - prioritize station code matches first
  const filteredStations = useMemo(() => {
    if (!inputValue || inputValue.length < 1) return [];
    
    const searchTerm = inputValue.toLowerCase().trim();
    
    // Separate matches by code and name
    const codeMatches: Station[] = [];
    const nameMatches: Station[] = [];
    
    stations.forEach(station => {
      const matchesCode = station.code.toLowerCase().includes(searchTerm);
      const matchesName = station.name.toLowerCase().includes(searchTerm);
      
      if (matchesCode) {
        codeMatches.push(station);
      } else if (matchesName) {
        nameMatches.push(station);
      }
    });
    
    // Combine: code matches first, then name matches
    return [...codeMatches, ...nameMatches].slice(0, 50); // Limit to 50 results for performance
  }, [inputValue, stations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent component
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectStation = (station: Station) => {
    const formattedValue = `${station.name} (${station.code})`;
    setInputValue(formattedValue);
    onChange(formattedValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredStations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredStations[highlightedIndex]) {
          handleSelectStation(filteredStations[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue && !loadError) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-gray-700 font-medium mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={isLoading ? "Loading stations..." : placeholder}
          disabled={isLoading || !!loadError}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${isLoading || loadError ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {loadError && (
        <p className="text-amber-600 text-sm mt-1">
          {loadError}. You can still type the station name manually.
        </p>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !isLoading && !loadError && filteredStations.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {filteredStations.map((station, index) => (
            <li
              key={`${station.code}-${index}`}
              onClick={() => handleSelectStation(station)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleSelectStation(station);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors touch-manipulation select-none ${
                index === highlightedIndex
                  ? 'bg-travel-blue-dark text-white'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{station.name}</span>
                <span className={`text-xs font-mono ${
                  index === highlightedIndex ? 'text-travel-orange' : 'text-gray-500'
                }`}>
                  {station.code}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && !isLoading && !loadError && inputValue && filteredStations.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
          No stations found. You can still type the station name manually.
        </div>
      )}
    </div>
  );
};
