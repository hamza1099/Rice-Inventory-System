export type EntryMode = 'kg' | 'bags' | 'mund' | 'packet' | 'liter';

export interface Product {
  id: string;
  name: string;
  urduName: string;
  category: string;
  badgeLabel: string;
  ratePerKg: number;
  unitLabel?: string; // '/ kg', '/ pkt', '/ liter'
  availableKg: number;
  availableStockLabel?: string;
  binLocation: string;
  imageUrl?: string;
  brand?: string; // 'Shan', 'National', 'Dalda', 'Habib', 'BRT'
  isLowStock?: boolean;
  isWholesalePack?: boolean;
  wholesaleBoriPrice?: number;
  boriWeightKg?: number;
  shortcut: string;
  tareWeightDefault?: number; // e.g. 0.10 kg for plastic bag, 0.95 kg for jute
}

export interface CartItem {
  id: string;
  product: Product;
  mode: EntryMode;
  grossWeight: number;
  tareWeight: number;
  tareName: string;
  netWeight: number;
  ratePerKg: number;
  subtotal: number;
}

export interface MemoRecord {
  id: string;
  memoNo: string;
  dateStr: string;
  timeStr: string;
  customerName: string;
  customerMeta: string;
  itemsSummary: string;
  weightSummary: string;
  paymentMode: 'SPOT CASH' | 'RAAST ONLINE';
  netAmount: number;
  grossAmount: number;
  discount: number;
  items: CartItem[];
  cashier: string;
  counterId: string;
}

export interface InventoryItem {
  id: string;
  varietyName: string;
  urduName: string;
  sku: string;
  category: string;
  packagingStandard: string;
  tareDeductionKg: number;
  physicalStockKg: number;
  bagsCount: number;
  bagTypeLabel: string;
  lotStatus: 'In Stock' | 'Critical Low' | 'Low Stock' | 'Out of Stock';
  costPerKg: number;
  previousCostPerKg?: number;
  latestInwardCostPerKg?: number;
  latestInwardDate?: string;
  costDifferencePerKg?: number;
  counterRatePerKg: number;
  marginPerKg: number;
  marginPercentage?: number;
  moisturePercentage: number;
  qualityNotes?: string;
  imageUrl?: string;
  isRateFixed?: boolean;
}

export interface DenominationRow {
  denomination: number;
  label: string;
  bundle: string;
  multiplier: string;
  count: number;
  subtotal: number;
}

export interface ImagePreviewData {
  imageUrl: string;
  title: string;
  urduTitle?: string;
  category?: string;
  badgeLabel?: string;
  rate?: number;
  unitLabel?: string;
  stock?: string;
  binLocation?: string;
  product?: Product;
}

