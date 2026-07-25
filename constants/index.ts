export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBg: string;
  white: string;
  black: string;
}

export const COLORS: ThemeColors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#F87171',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',
};

export const DARK_COLORS: ThemeColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  success: '#4ADE80',
  successLight: '#86EFAC',
  warning: '#FBBF24',
  warningLight: '#FDE68A',
  danger: '#F87171',
  dangerLight: '#FCA5A5',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  inputBg: '#1E293B',
  white: '#000000',
  black: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 999,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  title: 32,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const STORAGE_KEYS = {
  CUSTOMERS: '@repair_accountant_customers',
  REPAIRS: '@repair_accountant_repairs',
  EXPENSES: '@repair_accountant_expenses',
  INCOMES: '@repair_accountant_incomes',
  SETTINGS: '@repair_accountant_settings',
};

export const REPAIR_STATUS_COLORS: Record<string, string> = {
  Received: '#3B82F6',
  'Under Inspection': '#8B5CF6',
  'Waiting Parts': '#F59E0B',
  'In Progress': '#06B6D4',
  Completed: '#22C55E',
  Delivered: '#6B7280',
  Cancelled: '#EF4444',
};

export const EXPENSE_CATEGORIES = [
  'Parts Purchase',
  'Electricity',
  'Rent',
  'Transportation',
  'Tools',
  'Miscellaneous',
] as const;

export const DEVICE_TYPES = [
  'Smartphone',
  'Tablet',
  'Laptop',
  'Desktop Computer',
  'Router',
  'TV Receiver',
  'LED Light',
  'Home Appliance',
  'Electronic Board',
  'Power Supply',
  'Charger',
  'Other',
] as const;
