/**
 * Centralized Station Data Loader
 * 
 * This utility provides a singleton pattern for loading and caching railway station data.
 * It ensures that the data.json file is only fetched once and shared across all components,
 * eliminating loading delays and redundant network requests.
 * 
 * Features:
 * - Single fetch: Data loaded only once and cached in memory
 * - Multiple subscribers: Multiple components can wait for the same data load
 * - Preloading support: Data can be preloaded before components mount
 * - Error handling: Graceful error handling with retry capability
 */

export interface Station {
  name: string;
  code: string;
}

interface StationDataState {
  data: Station[] | null;
  isLoading: boolean;
  error: string | null;
  loadPromise: Promise<Station[]> | null;
}

// Global state for station data (singleton pattern)
const stationDataState: StationDataState = {
  data: null,
  isLoading: false,
  error: null,
  loadPromise: null
};

/**
 * Load station data from data.json
 * This function ensures data is only loaded once, even if called multiple times simultaneously
 */
export async function loadStationData(): Promise<Station[]> {
  // If data is already loaded, return it immediately
  if (stationDataState.data) {
    return stationDataState.data;
  }

  // If data is currently being loaded, return the existing promise
  if (stationDataState.loadPromise) {
    return stationDataState.loadPromise;
  }

  // Start loading data
  stationDataState.isLoading = true;
  stationDataState.error = null;

  stationDataState.loadPromise = (async () => {
    try {
      const response = await fetch('/data.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load stations: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Flatten all stations from all states
      const allStations: Station[] = [];
      if (data.states && Array.isArray(data.states)) {
        data.states.forEach((state: any) => {
          if (state.stations && Array.isArray(state.stations)) {
            allStations.push(...state.stations);
          }
        });
      }
      
      // Cache the data
      stationDataState.data = allStations;
      stationDataState.isLoading = false;
      
      return allStations;
    } catch (error) {
      console.error('Error loading station data:', error);
      stationDataState.error = error instanceof Error ? error.message : 'Failed to load station data';
      stationDataState.isLoading = false;
      stationDataState.loadPromise = null; // Allow retry
      throw error;
    }
  })();

  return stationDataState.loadPromise;
}

/**
 * Get the current state of station data
 * Useful for checking if data is already loaded before making decisions
 */
export function getStationDataState(): {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
} {
  return {
    isLoaded: stationDataState.data !== null,
    isLoading: stationDataState.isLoading,
    error: stationDataState.error
  };
}

/**
 * Get cached station data synchronously (if available)
 * Returns null if data hasn't been loaded yet
 */
export function getCachedStationData(): Station[] | null {
  return stationDataState.data;
}

/**
 * Preload station data without waiting
 * Useful for loading data in the background when page loads
 */
export function preloadStationData(): void {
  // Only preload if not already loaded or loading
  if (!stationDataState.data && !stationDataState.loadPromise) {
    loadStationData().catch(error => {
      console.error('Background preload failed:', error);
      // Silently fail for preload - components will retry when they mount
    });
  }
}

/**
 * Clear cached data (useful for testing or forced refresh)
 */
export function clearStationDataCache(): void {
  stationDataState.data = null;
  stationDataState.isLoading = false;
  stationDataState.error = null;
  stationDataState.loadPromise = null;
}
