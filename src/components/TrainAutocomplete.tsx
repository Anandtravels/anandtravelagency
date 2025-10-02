import { useState, useEffect, useRef, useMemo } from 'react';
import { Train as TrainIcon, ChevronDown, Loader2 } from 'lucide-react';

interface Train {
  number: string;
  name: string;
  from?: string;
  to?: string;
}

interface TrainAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  onReset?: () => void;
}

export const TrainAutocomplete = ({
  value,
  onChange,
  placeholder = "Search train number or name...",
  error,
  label,
  required = false,
  onReset
}: TrainAutocompleteProps) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Load trains from trains_numbers.json
  useEffect(() => {
    const loadTrains = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const response = await fetch('/trains_numbers.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load trains: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Convert object structure to array
        const trainsList: Train[] = [];
        for (const [trainNumber, trainData] of Object.entries(data)) {
          const train = trainData as any;
          
          // Extract from and to station names
          let fromStation = '';
          let toStation = '';
          
          if (train.from && typeof train.from === 'object') {
            fromStation = Object.values(train.from)[0] as string;
          }
          
          if (train.to && typeof train.to === 'object') {
            toStation = Object.values(train.to)[0] as string;
          }
          
          trainsList.push({
            number: trainNumber,
            name: train.name || '',
            from: fromStation,
            to: toStation
          });
        }
        
        setTrains(trainsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading trains:', error);
        setLoadError('Could not load train data');
        setIsLoading(false);
      }
    };

    loadTrains();
  }, []);

  // Update input value when prop value changes (for reset functionality)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter trains based on input with debouncing effect
  const filteredTrains = useMemo(() => {
    if (!inputValue || inputValue.length < 1) return [];
    
    const searchTerm = inputValue.toLowerCase().trim();
    
    return trains
      .filter(train => 
        train.number.toLowerCase().includes(searchTerm) ||
        train.name.toLowerCase().includes(searchTerm) ||
        (train.from && train.from.toLowerCase().includes(searchTerm)) ||
        (train.to && train.to.toLowerCase().includes(searchTerm))
      )
      .slice(0, 50); // Limit to 50 results for performance
  }, [inputValue, trains]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSelectTrain = (train: Train) => {
    const formattedValue = `${train.name} (${train.number})`;
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
          prev < filteredTrains.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredTrains[highlightedIndex]) {
          handleSelectTrain(filteredTrains[highlightedIndex]);
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
        <TrainIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={isLoading ? "Loading trains..." : placeholder}
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
          {loadError}. You can still type the train information manually.
        </p>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !isLoading && !loadError && filteredTrains.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredTrains.map((train, index) => (
            <li
              key={`${train.number}-${index}`}
              onClick={() => handleSelectTrain(train)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex
                  ? 'bg-travel-blue-dark text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{train.name}</div>
                  {(train.from || train.to) && (
                    <div className={`text-xs mt-1 ${
                      index === highlightedIndex ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {train.from && train.to ? (
                        <span>{train.from} → {train.to}</span>
                      ) : train.from ? (
                        <span>From: {train.from}</span>
                      ) : train.to ? (
                        <span>To: {train.to}</span>
                      ) : null}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-mono font-semibold flex-shrink-0 ${
                  index === highlightedIndex ? 'text-travel-orange' : 'text-travel-blue-dark'
                }`}>
                  #{train.number}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && !isLoading && !loadError && inputValue && filteredTrains.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
          No trains found. You can still type the train information manually.
        </div>
      )}
    </div>
  );
};
