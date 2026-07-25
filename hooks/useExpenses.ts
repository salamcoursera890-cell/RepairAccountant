import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../models';
import { api } from '../services/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await api.expenses.list();
      setExpenses(data);
    } catch (e) {
      console.error('Failed to load expenses:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const expense = await api.expenses.create(data);
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await api.expenses.delete(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    reload: loadExpenses,
  };
};
