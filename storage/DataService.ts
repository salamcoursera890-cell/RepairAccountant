import { Customer, Repair, Expense, Income, AppData, AppSettings } from '../models';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants';

export const DataService = {
  async getAllData(): Promise<AppData> {
    const [customers, repairs, expenses, incomes, settings] = await Promise.all([
      StorageService.get<Customer[]>(STORAGE_KEYS.CUSTOMERS) || Promise.resolve([]),
      StorageService.get<Repair[]>(STORAGE_KEYS.REPAIRS) || Promise.resolve([]),
      StorageService.get<Expense[]>(STORAGE_KEYS.EXPENSES) || Promise.resolve([]),
      StorageService.get<Income[]>(STORAGE_KEYS.INCOMES) || Promise.resolve([]),
      StorageService.get<AppSettings>(STORAGE_KEYS.SETTINGS) || Promise.resolve(null),
    ]);

    return {
      customers: customers || [],
      repairs: repairs || [],
      expenses: expenses || [],
      incomes: incomes || [],
      settings: settings || { isDarkMode: false, language: 'ar', currency: 'IQD', repairCounter: 0 },
    };
  },

  async exportAllData(): Promise<string> {
    const data = await this.getAllData();
    return JSON.stringify(data, null, 2);
  },

  async importAllData(jsonString: string): Promise<boolean> {
    try {
      const data: AppData = JSON.parse(jsonString);
      if (!data.customers || !data.repairs || !data.expenses || !data.incomes) {
        return false;
      }
      await Promise.all([
        StorageService.set(STORAGE_KEYS.CUSTOMERS, data.customers),
        StorageService.set(STORAGE_KEYS.REPAIRS, data.repairs),
        StorageService.set(STORAGE_KEYS.EXPENSES, data.expenses),
        StorageService.set(STORAGE_KEYS.INCOMES, data.incomes),
      ]);
      return true;
    } catch {
      return false;
    }
  },

  async clearAllData(): Promise<void> {
    await Promise.all([
      StorageService.remove(STORAGE_KEYS.CUSTOMERS),
      StorageService.remove(STORAGE_KEYS.REPAIRS),
      StorageService.remove(STORAGE_KEYS.EXPENSES),
      StorageService.remove(STORAGE_KEYS.INCOMES),
    ]);
  },
};
