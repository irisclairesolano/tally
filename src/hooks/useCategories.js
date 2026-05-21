import { useEffect, useState } from 'react';
import { fallbackCategories } from '../data/categories';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [items, setItems]     = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon, color, type')
          .order('name');
        
        if (!cancelled) {
          if (error) {
            const isNetworkError = error.message.includes('Network request failed');
            console.warn(isNetworkError ? 'Network error, using fallbacks' : 'Supabase categories fetch failed, using fallbacks:', error.message);
            setError(error.message);
            setItems(fallbackCategories);
          } else if (data && data.length > 0) {
            setItems(data);
          } else {
            setItems(fallbackCategories);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const isNetworkError = e.message.includes('Network request failed');
          console.warn(isNetworkError ? 'Network error, using fallbacks' : 'Supabase error, using fallbacks:', e.message);
          setError(e.message);
          setItems(fallbackCategories);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}
