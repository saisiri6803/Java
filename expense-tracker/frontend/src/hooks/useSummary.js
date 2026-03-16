import { useState, useEffect, useCallback } from 'react';
import { getSummary } from '../services/api';

export function useSummary(refreshTrigger) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshTrigger]);

  return { summary, loading, error, refetch: fetchSummary };
}
