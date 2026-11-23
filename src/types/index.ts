export type EntryMode = 'kg' | 'bags' | 'mund' | 'packet' | 'liter';

export interface Product {
  id: string;
  name: string;
  urduName: string;
  category: string;
  badgeLabel: string;
  ratePerKg: number;
  costPerKg?: number;
  unitLabel?: string; // '/ kg', '/ pkt', '/ liter'
  availableKg: number;
  availableStockLabel?: string;
  binLocation: string;
  imageUrl?: string;
  brand?: string; // 'Shan', 'National', 'Dalda', 'Habib', 'BRT'
  isLowStock?: boolean;
  minStockThreshold?: number;
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
  costPerKg?: number;
  subtotal: number;
}

export type PaymentMode = 'SPOT CASH' | 'RAAST ONLINE' | 'KHATA / CREDIT';

export interface MemoRecord {
  id: string;
  memoNo: string;
  dateStr: string;
  timeStr: string;
  customerName: string;
  customerMeta: string;
  itemsSummary: string;
  weightSummary: string;
  paymentMode: PaymentMode;
  netAmount: number;
  grossAmount: number;
  discount: number;
  items: CartItem[];
  cashier: string;
  counterId: string;
  khataCustomerId?: string;
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
  minStockThreshold?: number;
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
  unitType?: 'kg' | 'piece' | 'liter';
  unitLabel?: string;
  unitsPerPack?: number;
  costPerBag?: number;
  counterRatePerBag?: number;
  packTypeLabel?: string;
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

// ==================== SUPPLIER / MILL KHATA TYPES ====================
export interface SupplierItemEntry {
  productName: string;
  urduName?: string;
  bags: number;
  weightPerBag: number;
  totalKg: number;
  ratePerBag?: number;
  ratePerKg?: number;
  subtotal: number;
  unit?: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  dateStr: string;
  timeStr: string;
  timestamp: number;
  type: 'PURCHASE' | 'PAYMENT' | 'OPENING_BALANCE' | 'RETURN';
  description: string;
  items?: SupplierItemEntry[];
  vehicleNo?: string; // گاڑی نمبر
  biltyNo?: string; // بلٹی / گیٹ پاس نمبر
  billAmount: number; // خریداری رقم (مال کی قیمت)
  paidAmount: number; // ادا شدہ رقم
  balanceAfter: number; // بقایا رقم جو ہم نے دینی ہے
  paymentMode?: 'CASH' | 'RAAST' | 'BANK' | 'CHEQUE';
  referenceNo?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string; // Mill or Dealer Name
  urduName?: string;
  contactPerson?: string;
  phone: string;
  city: string;
  address?: string;
  totalPurchases: number; // کل خریدا گیا مال
  totalPaid: number; // کل ادا شدہ رقم
  currentBalance: number; // واجب الادا بقایا رقم
  status: 'ACTIVE' | 'SETTLED';
  createdAt: string;
  lastTransactionDate?: string;
  notes?: string;
}


