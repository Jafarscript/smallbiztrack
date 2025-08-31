import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios"; // Your configured axios instance

/**
 * A custom hook to fetch data from the API with support for
 * query parameters, pagination, loading, and error states.
 * @param {string} endpoint - The API endpoint to fetch data from (e.g., "/sales").
 * @param {object} initialQuery - The initial query parameters for sorting, filtering, etc.
 * @returns {object} - An object containing data, metadata, query state, loading/error states, and functions to update them.
 */
const useApi = (endpoint, initialQuery = {}) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback ensures the function isn't recreated on every render,
  // preventing unnecessary useEffect runs.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params: query });
      // Assumes your API returns data in a structure like: { data: [...], totalPages: 5, total: 50, page: 1 }
      setData(res.data.data || []);
      setMeta({
        page: res.data.page || 1,
        totalPages: res.data.totalPages || 1,
        total: res.data.total || 0,
      });
    } catch (err) {
      console.error(`Failed to fetch from ${endpoint}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, query]);

  // This useEffect runs the fetchData function whenever it changes (i.e., when endpoint or query changes).
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // We return the state and a function to manually trigger a refetch.
  return {
    data,
    meta,
    query,
    setQuery,
    isLoading,
    error,
    reloadData: fetchData, // Expose fetchData as reloadData for manual refresh
  };
};

export default useApi;