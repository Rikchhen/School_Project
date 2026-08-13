import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/**
 * Fetch data from the API with loading/error state and a manual `refetch`.
 * `path` is re-requested whenever it (or any dep in `deps`) changes.
 */
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(path, undefined, { signal });
        setData(res);
      } catch (err) {
        if (err?.name !== "AbortError") setError(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, ...deps]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    refetch(ctrl.signal);
    return () => ctrl.abort();
  }, [refetch]);

  return { data, loading, error, refetch: () => refetch() };
}

export default useFetch;
