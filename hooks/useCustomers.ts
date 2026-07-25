import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../models';
import { api } from '../services/api';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const addCustomer = useCallback(async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const customer = await api.customers.create(data);
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const updated = await api.customers.update(id, data);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    await api.customers.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const searchCustomers = useCallback(
    (query: string) => {
      if (!query.trim()) return customers;
      const lower = query.toLowerCase();
      return customers.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.phone.includes(query)
      );
    },
    [customers]
  );

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    reload: loadCustomers,
  };
};
