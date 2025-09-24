// hooks/useSuggestions.ts - Custom hook for managing suggestions state
import { useState, useEffect, useCallback } from 'react';
import { suggestionsApi } from '../lib/suggestions';
import type { SuggestionsResponse } from '../lib/suggestions';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const fetchSuggestions = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Check cache if not forcing refresh
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await suggestionsApi.getSuggestions(forceRefresh);
      setSuggestions(data);
      setLastFetch(now);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  const refreshSuggestions = useCallback(() => {
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refreshSuggestions,
    isStale: lastFetch ? (Date.now() - lastFetch) > CACHE_DURATION : true
  };
};
