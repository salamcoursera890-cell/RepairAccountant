export enum RepairStatus {
  Received = 'Received',
  UnderInspection = 'Under Inspection',
  WaitingParts = 'Waiting Parts',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum DeviceType {
  Smartphone = 'Smartphone',
  Tablet = 'Tablet',
  Laptop = 'Laptop',
  Desktop = 'Desktop Computer',
  Router = 'Router',
  TVReceiver = 'TV Receiver',
  LEDLight = 'LED Light',
  HomeAppliance = 'Home Appliance',
  ElectronicBoard = 'Electronic Board',
  PowerSupply = 'Power Supply',
  Charger = 'Charger',
  Other = 'Other',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repair {
  id: string;
  repairNumber: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  problemDescription: string;
  estimatedCost: number;
  finalCost: number;
  status: RepairStatus;
  receivedDate: string;
  deliveryDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  customers: Customer[];
  repairs: Repair[];
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
}

export interface AppSettings {
  isDarkMode: boolean;
  language: string;
  currency: string;
  repairCounter: number;
}
