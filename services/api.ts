import Constants from 'expo-constants';

const API_BASE = (Constants.expoConfig?.extra?.apiUrl as string) || 'http://192.168.1.106:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

function mapSnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapSnakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
    result[camelKey] = mapSnakeToCamel(obj[key]);
  }
  return result;
}

function mapCamelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapCamelToSnake);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    result[snakeKey] = mapCamelToSnake(obj[key]);
  }
  return result;
}

export const api = {
  customers: {
    list: async (search?: string) => {
      const data = await request<any[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      return mapSnakeToCamel(data);
    },
    get: async (id: string) => mapSnakeToCamel(await request<any>(`/customers/${id}`)),
    create: async (data: any) => mapSnakeToCamel(await request<any>('/customers', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: string, data: any) => mapSnakeToCamel(await request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: (id: string) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
  },
  repairs: {
    list: async (search?: string, status?: string) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const qs = params.toString();
      const data = await request<any[]>(`/repairs${qs ? `?${qs}` : ''}`);
      return mapSnakeToCamel(data);
    },
    get: async (id: string) => mapSnakeToCamel(await request<any>(`/repairs/${id}`)),
    create: async (data: any) => mapSnakeToCamel(await request<any>('/repairs', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: string, data: any) => mapSnakeToCamel(await request<any>(`/repairs/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: (id: string) => request<any>(`/repairs/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    list: async (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      const data = await request<any[]>(`/expenses${qs ? `?${qs}` : ''}`);
      return mapSnakeToCamel(data);
    },
    get: async (id: string) => mapSnakeToCamel(await request<any>(`/expenses/${id}`)),
    create: async (data: any) => mapSnakeToCamel(await request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: string, data: any) => mapSnakeToCamel(await request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: (id: string) => request<any>(`/expenses/${id}`, { method: 'DELETE' }),
  },
  incomes: {
    list: async (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      const data = await request<any[]>(`/incomes${qs ? `?${qs}` : ''}`);
      return mapSnakeToCamel(data);
    },
    get: async (id: string) => mapSnakeToCamel(await request<any>(`/incomes/${id}`)),
    create: async (data: any) => mapSnakeToCamel(await request<any>('/incomes', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: string, data: any) => mapSnakeToCamel(await request<any>(`/incomes/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: (id: string) => request<any>(`/incomes/${id}`, { method: 'DELETE' }),
  },
  accounting: {
    summary: () => request<any>('/accounting/summary'),
  },
  settings: {
    get: () => request<any>('/settings'),
    update: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  data: {
    export: () => request<any>('/data/export'),
    import: (data: any) => request<any>('/data/import', { method: 'POST', body: JSON.stringify(data) }),
    clear: () => request<any>('/data/clear', { method: 'DELETE' }),
  },
};
