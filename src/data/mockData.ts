import type { Product, InventoryItem, MemoRecord, DenominationRow } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_MEMOS: MemoRecord[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_DENOMINATIONS: DenominationRow[] = [
  { denomination: 5000, label: 'PKR 5,000', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 1000, label: 'PKR 1,000', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 500, label: 'PKR 500', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 100, label: 'PKR 100', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 50, label: 'PKR 50', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 20, label: 'PKR 20', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 10, label: 'PKR 10', bundle: 'Loose', multiplier: '×', count: 0, subtotal: 0 },
  { denomination: 0, label: 'Coins / Change', bundle: 'Coin Tray', multiplier: '-', count: 0, subtotal: 0 }
];
