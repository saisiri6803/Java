import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../services/api';

export function useTransactions(filters = {}, refreshTrigger) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type && filters.type !== 'ALL') params.type = filters.type;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await getTransactions(params);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.search, filters.startDate, filters.endDate, refreshTrigger]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
