import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import fdrService from '../services/fdrService.js';

export function useFdrs(initialFilters = {}) {
  const { currentUser } = useAuth();
  const [fdrs, setFdrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadFdrs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await fdrService.getFdrs(filters, currentUser);
      setFdrs(records);
    } catch (err) {
      setError(err.message || 'Failed to load FDR records.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    loadFdrs();
  }, [loadFdrs]);

  return {
    fdrs,
    loading,
    error,
    filters,
    setFilters,
    refresh: loadFdrs,
  };
}

export default useFdrs;
