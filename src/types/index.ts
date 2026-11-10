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

// ==================== KHATA / UDHAR LEDGER TYPES ====================
export interface KhataItemEntry {
  productName: string;
  urduName?: string;
  quantity: number;
  unit: string;
  rate: number;
  subtotal: number;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  dateStr: string;
  timeStr: string;
  timestamp: number;
  type: 'PURCHASE' | 'PAYMENT' | 'OPENING_BALANCE';
  description: string;
  items?: KhataItemEntry[];
  debit: number; // Amount added to udhar (بنام)
  credit: number; // Amount paid / received (جمع)
  balanceAfter: number; // Running balance after this entry
  paymentMode?: 'CASH' | 'RAAST' | 'BANK' | 'CHEQUE';
  referenceNo?: string;
  notes?: string;
}

export interface KhataCustomer {
  id: string;
  customerName: string;
  urduName?: string;
  shopName: string;
  phone: string;
  address: string;
  creditLimit?: number;
  totalDebit: number; // Total purchases
  totalCredit: number; // Total payments received
  currentBalance: number; // Remaining balance
  status: 'ACTIVE' | 'SETTLED';
  createdAt: string;
  lastTransactionDate?: string;
  notes?: string;
}


