import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon, color, type')
        .order('name');
      if (!cancelled) {
        if (!error) setItems(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
