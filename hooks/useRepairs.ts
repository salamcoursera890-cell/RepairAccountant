import { useState, useEffect, useCallback } from 'react';
import { Repair } from '../models';
import { api } from '../services/api';

export const useRepairs = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRepairs = useCallback(async () => {
    try {
      const data = await api.repairs.list();
      setRepairs(data);
    } catch (e) {
      console.error('Failed to load repairs:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  const addRepair = useCallback(async (data: Omit<Repair, 'id' | 'repairNumber' | 'createdAt' | 'updatedAt'>) => {
    const repair = await api.repairs.create(data);
    setRepairs((prev) => [repair, ...prev]);
    return repair;
  }, []);

  const updateRepair = useCallback(async (id: string, data: Partial<Repair>) => {
    const updated = await api.repairs.update(id, data);
    setRepairs((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteRepair = useCallback(async (id: string) => {
    await api.repairs.delete(id);
    setRepairs((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const searchRepairs = useCallback(
    (query: string) => {
      if (!query.trim()) return repairs;
      const lower = query.toLowerCase();
      return repairs.filter(
        (r) =>
          r.customerName.toLowerCase().includes(lower) ||
          r.customerPhone.includes(query) ||
          r.repairNumber.toString() === query ||
          r.brand.toLowerCase().includes(lower) ||
          r.model.toLowerCase().includes(lower)
      );
    },
    [repairs]
  );

  return {
    repairs,
    isLoading,
    addRepair,
    updateRepair,
    deleteRepair,
    searchRepairs,
    reload: loadRepairs,
  };
};
