import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fallbackTransactions } from '../data/transactions';

export function useTransactions() {
  const [items, setItems]     = useState(fallbackTransactions);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, title, amount, note, occurred_at,
          category:categories ( id, name, icon, color, type )
        `)
        .order('occurred_at', { ascending: false });

      if (error) {
        console.warn('Supabase transactions fetch failed, using fallbacks:', error.message);
        setError(error.message);
        // Don't overwrite if we already have items (might be from a previous successful fetch)
        setItems(prev => prev.length > 0 ? prev : fallbackTransactions);
      } else if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems(fallbackTransactions);
      }
    } catch (e) {
      console.warn('Supabase error, using fallbacks:', e.message);
      setItems(prev => prev.length > 0 ? prev : fallbackTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (payload) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    await fetchAll();
    return data;
  }, [fetchAll]);

  const update = useCallback(async (id, patch) => {
    const { error } = await supabase
      .from('transactions')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived totals — computed from items, never stored
  const income   = items.filter(t => Number(t.amount) > 0)
                        .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = items.filter(t => Number(t.amount) < 0)
                        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const balance  = income - expenses;

  return { items, loading, error, fetchAll, add, update, remove, income, expenses, balance };
}
