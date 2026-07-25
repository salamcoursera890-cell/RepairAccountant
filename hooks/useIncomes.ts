import { useState, useEffect, useCallback } from 'react';
import { Income } from '../models';
import { api } from '../services/api';

export const useIncomes = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadIncomes = useCallback(async () => {
    try {
      const data = await api.incomes.list();
      setIncomes(data);
    } catch (e) {
      console.error('Failed to load incomes:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const addIncome = useCallback(async (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    const income = await api.incomes.create(data);
    setIncomes((prev) => [income, ...prev]);
    return income;
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    await api.incomes.delete(id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    incomes,
    isLoading,
    addIncome,
    deleteIncome,
    reload: loadIncomes,
  };
};
