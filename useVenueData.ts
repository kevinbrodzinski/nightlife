
import { useState, useEffect } from 'react';
import type { Venue, RawVenueData } from '../types';
import { fetchInitialVenueData } from '../services/geminiService';

const LOCAL_STORAGE_KEY = 'nightlifeFinderVenues';

export const useVenueData = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData) as Venue[];
           // Basic check to ensure cache is not empty or malformed
          if (parsedCache && parsedCache.length > 0 && parsedCache[0].id) {
            setVenues(parsedCache);
            setIsLoading(false);
            return;
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear bad cache
          }
        }

        // If no valid cache, fetch from Gemini
        const fetchedRawData: RawVenueData[] = await fetchInitialVenueData();
        const processedVenues: Venue[] = fetchedRawData.map(rawVenue => ({
            ...rawVenue,
            // currentPopularity and currentPopularityScore will be added in App.tsx based on filters
        }));
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedVenues));
        setVenues(processedVenues);

      } catch (err) {
        console.error("Failed to load venue data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading venues.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return { venues, isLoading, error };
};