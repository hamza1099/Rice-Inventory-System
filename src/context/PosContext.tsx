import React, { createContext, useContext, useState } from 'react';
import type {
  Product,
  CartItem,
  MemoRecord,
  InventoryItem,
  DenominationRow,
  ImagePreviewData,
  KhataCustomer,
  KhataTransaction,
  KhataItemEntry
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_MEMOS, INITIAL_INVENTORY, INITIAL_DENOMINATIONS } from '../data/mockData';
import { INITIAL_KHATA_CUSTOMERS, INITIAL_KHATA_TRANSACTIONS } from '../data/mockKhataData';

interface PosContextType {
  // Products & Cart
  products: Product[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (p: Product | null) => void;

  // Scale Terminal Simulation
  liveScaleWeight: number;
  setLiveScaleWeight: (wt: number) => void;
  isScaleLocked: boolean;
  setIsScaleLocked: (locked: boolean) => void;
  scaleTare: number;
  setScaleTare: (tare: number) => void;

  // Checkout & Memos
  spotDiscount: number;
  setSpotDiscount: (disc: number) => void;
  paymentMode: 'SPOT CASH' | 'RAAST ONLINE';
  setPaymentMode: (mode: 'SPOT CASH' | 'RAAST ONLINE') => void;
  cashReceived: number;
  setCashReceived: (val: number) => void;
  completeSale: () => MemoRecord | null;
  memos: MemoRecord[];
  activeReceipt: MemoRecord | null;
  setActiveReceipt: (rec: MemoRecord | null) => void;

  // Inventory & Product CRUD
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updated: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateInventoryRate: (id: string, newRate: number, newCost?: number) => void;
  addStockInward: (
    id: string,
    additionalKg: number,
    additionalBags: number,
    inwardCostPerKg?: number,
    updatedSellingRate?: number
  ) => void;

  // Day-End Reconciliation & Cash Drawer Float
  denominations: DenominationRow[];
  updateDenominationCount: (index: number, count: number) => void;
  openingFloat: number;
  setOpeningFloat: (val: number) => void;
  isDrawerOpen: boolean;
  drawerOpenedAt: string | null;
  isOpeningModalOpen: boolean;
  setIsOpeningModalOpen: (open: boolean) => void;
  openDrawer: (amount: number, cashierName?: string, notes?: string) => void;
  closeDrawer: () => void;
  startNewDay: () => void;
  supervisorPin: string;
  setSupervisorPin: (pin: string) => void;
  handoverNotes: string;
  setHandoverNotes: (notes: string) => void;
  isDayClosed: boolean;
  finalizeDayEnd: () => boolean;

  // Terminal Lock & Mandi Chit
  isTerminalLocked: boolean;
  setIsTerminalLocked: (locked: boolean) => void;
  isMandiChitOpen: boolean;
  setIsMandiChitOpen: (open: boolean) => void;

  // Image Preview Lightbox Modal
  imagePreview: ImagePreviewData | null;
  setImagePreview: (data: ImagePreviewData | null) => void;
  openImagePreview: (data: ImagePreviewData) => void;
  closeImagePreview: () => void;

  // Khata / Udhar Customer Book
  khataCustomers: KhataCustomer[];
  khataTransactions: KhataTransaction[];
  selectedKhataCustomerId: string | null;
  setSelectedKhataCustomerId: (id: string | null) => void;
  addKhataCustomer: (data: {
    customerName: string;
    urduName?: string;
    shopName: string;
    phone: string;
    address: string;
    creditLimit?: number;
    openingBalance?: number;
    notes?: string;
  }) => KhataCustomer;
  updateKhataCustomer: (id: string, updated: Partial<KhataCustomer>) => void;
  deleteKhataCustomer: (id: string) => void;
  addKhataPurchase: (
    customerId: string,
    amount: number,
    description: string,
    items?: KhataItemEntry[],
    notes?: string
  ) => void;
  addKhataPayment: (
    customerId: string,
    amount: number,
    paymentMode: 'CASH' | 'RAAST' | 'BANK' | 'CHEQUE',
    notes?: string,
    referenceNo?: string
  ) => void;
  deleteKhataTransaction: (txId: string) => void;

  // Language Toggle (English / Urdu)
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // Preload cart with items matching Image 3 (Cash Memo #1085)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-1',
      product: INITIAL_PRODUCTS[0], // Super Basmati
      mode: 'kg',
      grossWeight: 10.10,
      tareWeight: 0.10,
      tareName: 'پلاسٹک تھیلی',
      netWeight: 10.00,
      ratePerKg: 380,
      subtotal: 3800
    },
    {
      id: 'cart-2',
      product: INITIAL_PRODUCTS[1], // Kainat 1121 Steam
      mode: 'kg',
      grossWeight: 5.10,
      tareWeight: 0.10,
      tareName: 'پلاسٹک تھیلی',
      netWeight: 5.00,
      ratePerKg: 340,
      subtotal: 1700
    },
    {
      id: 'cart-3',
      product: INITIAL_PRODUCTS[4], // White Broken / Tota
      mode: 'kg',
      grossWeight: 4.10,
      tareWeight: 0.10,
      tareName: 'پلاسٹک تھیلی',
      netWeight: 4.00,
      ratePerKg: 210,
      subtotal: 840
    }
  ]);

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Live scale
  const [liveScaleWeight, setLiveScaleWeight] = useState<number>(4.50);
  const [isScaleLocked, setIsScaleLocked] = useState<boolean>(true);
  const [scaleTare, setScaleTare] = useState<number>(0.00);

  // Checkout
  const [spotDiscount, setSpotDiscount] = useState<number>(10);
  const [paymentMode, setPaymentMode] = useState<'SPOT CASH' | 'RAAST ONLINE'>('SPOT CASH');
  const [cashReceived, setCashReceived] = useState<number>(7000);
  const [memos, setMemos] = useState<MemoRecord[]>(INITIAL_MEMOS);
  const [activeReceipt, setActiveReceipt] = useState<MemoRecord | null>(null);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Day-End & Cash Drawer Opening
  const [denominations, setDenominations] = useState<DenominationRow[]>(INITIAL_DENOMINATIONS);
  const [openingFloat, setOpeningFloatState] = useState<number>(() => {
    const saved = localStorage.getItem('ricecms_opening_float');
    return saved ? parseFloat(saved) : 15000;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('ricecms_drawer_active');
    return saved !== null ? saved === 'true' : true;
  });
  const [drawerOpenedAt, setDrawerOpenedAt] = useState<string | null>(() => {
    return localStorage.getItem('ricecms_drawer_opened_at');
  });
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState<boolean>(false);

  const setOpeningFloat = (val: number) => {
    setOpeningFloatState(val);
    localStorage.setItem('ricecms_opening_float', val.toString());
  };

  const openDrawer = (amount: number, _cashierName?: string, _notes?: string) => {
    setOpeningFloatState(amount);
    setIsDrawerOpen(true);
    setIsDayClosed(false);
    const now = new Date().toISOString();
    setDrawerOpenedAt(now);
    setIsOpeningModalOpen(false);
    localStorage.setItem('ricecms_opening_float', amount.toString());
    localStorage.setItem('ricecms_drawer_active', 'true');
    localStorage.setItem('ricecms_drawer_opened_at', now);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    localStorage.setItem('ricecms_drawer_active', 'false');
  };

  const startNewDay = () => {
    setIsDayClosed(false);
    setIsDrawerOpen(false);
    localStorage.setItem('ricecms_drawer_active', 'false');
    setDenominations(INITIAL_DENOMINATIONS);
    setCart([]);
    setIsOpeningModalOpen(true);
  };

  const [supervisorPin, setSupervisorPin] = useState<string>('9921');
  const [handoverNotes, setHandoverNotes] = useState<string>(
    'All spot memos cleared, zero credit given. Cash ready for godown safe handover.'
  );
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(true);
  const [isMandiChitOpen, setIsMandiChitOpen] = useState<boolean>(false);

  // Global Image Preview Lightbox
  const [imagePreview, setImagePreview] = useState<ImagePreviewData | null>(null);

  const openImagePreview = (data: ImagePreviewData) => {
    setImagePreview(data);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  // Language State: 'en' or 'ur' (Persisted in localStorage)
  const [language, setLanguageState] = useState<'en' | 'ur'>(() => {
    return (localStorage.getItem('ricecms_lang') as 'en' | 'ur') || 'en';
  });

  const setLanguage = (lang: 'en' | 'ur') => {
    setLanguageState(lang);
    localStorage.setItem('ricecms_lang', lang);
  };

  // ==================== KHATA / UDHAR CUSTOMER BOOK ====================
  const [khataCustomers, setKhataCustomers] = useState<KhataCustomer[]>(INITIAL_KHATA_CUSTOMERS);
  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>(INITIAL_KHATA_TRANSACTIONS);
  const [selectedKhataCustomerId, setSelectedKhataCustomerId] = useState<string | null>(
    INITIAL_KHATA_CUSTOMERS[0]?.id || null
  );

  const addKhataCustomer = (data: {
    customerName: string;
    urduName?: string;
    shopName: string;
    phone: string;
    address: string;
    creditLimit?: number;
    openingBalance?: number;
    notes?: string;
  }): KhataCustomer => {
    const openingBal = data.openingBalance || 0;
    const newCust: KhataCustomer = {
      id: `khata-cust-${Date.now()}`,
      customerName: data.customerName.trim(),
      urduName: data.urduName?.trim() || data.customerName.trim(),
      shopName: data.shopName.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      creditLimit: data.creditLimit || 50000,
      totalDebit: openingBal,
      totalCredit: 0,
      currentBalance: openingBal,
      status: openingBal > 0 ? 'ACTIVE' : 'SETTLED',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastTransactionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: data.notes?.trim() || ''
    };

    setKhataCustomers((prev) => [newCust, ...prev]);
    setSelectedKhataCustomerId(newCust.id);

    if (openingBal > 0) {
      const now = new Date();
      const openTx: KhataTransaction = {
        id: `tx-${Date.now()}`,
        customerId: newCust.id,
        dateStr: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} PKT`,
        timestamp: Date.now(),
        type: 'OPENING_BALANCE',
        description: 'سابقہ پرانا کھاتہ (Opening Balance Brought Forward)',
        debit: openingBal,
        credit: 0,
        balanceAfter: openingBal,
        notes: 'Initial balance recorded at account opening'
      };
      setKhataTransactions((prev) => [openTx, ...prev]);
    }

    return newCust;
  };

  const updateKhataCustomer = (id: string, updated: Partial<KhataCustomer>) => {
    setKhataCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteKhataCustomer = (id: string) => {
    setKhataCustomers((prev) => prev.filter((c) => c.id !== id));
    setKhataTransactions((prev) => prev.filter((tx) => tx.customerId !== id));
    if (selectedKhataCustomerId === id) {
      const remaining = khataCustomers.filter((c) => c.id !== id);
      setSelectedKhataCustomerId(remaining[0]?.id || null);
    }
  };

  const addKhataPurchase = (
    customerId: string,
    amount: number,
    description: string,
    items?: KhataItemEntry[],
    notes?: string
  ) => {
    const cust = khataCustomers.find((c) => c.id === customerId);
    if (!cust) return;

    const newBalance = cust.currentBalance + amount;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} PKT`;

    const newTx: KhataTransaction = {
      id: `tx-${Date.now()}`,
      customerId,
      dateStr,
      timeStr,
      timestamp: Date.now(),
      type: 'PURCHASE',
      description,
      items,
      debit: amount,
      credit: 0,
      balanceAfter: newBalance,
      referenceNo: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      notes
    };

    setKhataTransactions((prev) => [newTx, ...prev]);

    setKhataCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            totalDebit: c.totalDebit + amount,
            currentBalance: newBalance,
            status: newBalance > 0 ? 'ACTIVE' : 'SETTLED',
            lastTransactionDate: dateStr
          };
        }
        return c;
      })
    );
  };

  const addKhataPayment = (
    customerId: string,
    amount: number,
    paymentMode: 'CASH' | 'RAAST' | 'BANK' | 'CHEQUE',
    notes?: string,
    referenceNo?: string
  ) => {
    const cust = khataCustomers.find((c) => c.id === customerId);
    if (!cust) return;

    const newBalance = Math.max(0, cust.currentBalance - amount);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} PKT`;

    const newTx: KhataTransaction = {
      id: `tx-${Date.now()}`,
      customerId,
      dateStr,
      timeStr,
      timestamp: Date.now(),
      type: 'PAYMENT',
      description:
        language === 'ur'
          ? `وصولی رقم (${paymentMode}): PKR ${amount.toLocaleString()} ادا کی گئی`
          : `Payment Received (${paymentMode}): PKR ${amount.toLocaleString()}`,
      debit: 0,
      credit: amount,
      balanceAfter: newBalance,
      paymentMode,
      referenceNo: referenceNo || `RCPT-${Math.floor(100 + Math.random() * 900)}`,
      notes
    };

    setKhataTransactions((prev) => [newTx, ...prev]);

    setKhataCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            totalCredit: c.totalCredit + amount,
            currentBalance: newBalance,
            status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE',
            lastTransactionDate: dateStr
          };
        }
        return c;
      })
    );
  };

  const deleteKhataTransaction = (txId: string) => {
    const tx = khataTransactions.find((t) => t.id === txId);
    if (!tx) return;

    setKhataTransactions((prev) => prev.filter((t) => t.id !== txId));

    setKhataCustomers((prev) =>
      prev.map((c) => {
        if (c.id === tx.customerId) {
          const newDebit = tx.type === 'PURCHASE' ? c.totalDebit - tx.debit : c.totalDebit;
          const newCredit = tx.type === 'PAYMENT' ? c.totalCredit - tx.credit : c.totalCredit;
          const newBalance = Math.max(0, newDebit - newCredit);
          return {
            ...c,
            totalDebit: newDebit,
            totalCredit: newCredit,
            currentBalance: newBalance,
            status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE'
          };
        }
        return c;
      })
    );
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSpotDiscount(10);
  };

  const completeSale = (): MemoRecord | null => {
    if (cart.length === 0) return null;

    const gross = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const net = gross - spotDiscount;
    const totalWeight = cart.reduce((sum, item) => sum + item.netWeight, 0);

    const now = new Date();
    const memoId = (1085 + memos.length - 5).toString();

    const newRecord: MemoRecord = {
      id: `memo-${memoId}`,
      memoNo: `#${memoId}`,
      dateStr: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} PKT`,
      customerName: 'Counter Retail Buyer',
      customerMeta: 'Spot Cash • Counter 01',
      itemsSummary: cart.map((c) => c.product.name).join(' + '),
      weightSummary: `${cart.length} Items (${totalWeight.toFixed(2)} KG)`,
      paymentMode,
      grossAmount: gross,
      discount: spotDiscount,
      netAmount: net,
      items: [...cart],
      cashier: 'S. Bukhari',
      counterId: 'Counter 01'
    };

    setMemos([newRecord, ...memos]);
    setActiveReceipt(newRecord);
    clearCart();
    return newRecord;
  };

  const addInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);

    // Also create or sync product in POS Counter
    const categoryMapping: string = newItem.category || 'Rice (چاول)';

    const newProd: Product = {
      id: newItem.id,
      name: newItem.varietyName,
      urduName: newItem.urduName,
      category: categoryMapping,
      badgeLabel: newItem.category.toUpperCase(),
      ratePerKg: newItem.counterRatePerKg,
      availableKg: newItem.physicalStockKg,
      binLocation: 'Godown Stack',
      imageUrl: newItem.imageUrl,
      shortcut: `F${100 + inventory.length + 1}`,
      tareWeightDefault: newItem.tareDeductionKg || 0.10
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const updateInventoryItem = (id: string, updated: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cost = updated.costPerKg !== undefined ? updated.costPerKg : item.costPerKg;
          const rate = updated.counterRatePerKg !== undefined ? updated.counterRatePerKg : item.counterRatePerKg;
          const margin = rate - cost;
          const marginPct = cost > 0 ? (margin / cost) * 100 : 0;
          const kg = updated.physicalStockKg !== undefined ? updated.physicalStockKg : item.physicalStockKg;
          return {
            ...item,
            ...updated,
            costPerKg: cost,
            counterRatePerKg: rate,
            marginPerKg: Math.round(margin * 100) / 100,
            marginPercentage: Math.round(marginPct * 10) / 10,
            lotStatus: kg > 200 ? 'In Stock' : kg > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return item;
      })
    );

    // Keep products synchronized
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name: updated.varietyName || p.name,
            urduName: updated.urduName || p.urduName,
            ratePerKg: updated.counterRatePerKg !== undefined ? updated.counterRatePerKg : p.ratePerKg,
            availableKg: updated.physicalStockKg !== undefined ? updated.physicalStockKg : p.availableKg,
            imageUrl: updated.imageUrl !== undefined ? updated.imageUrl : p.imageUrl
          };
        }
        return p;
      })
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateInventoryRate = (id: string, newRate: number, newCost?: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cost = newCost !== undefined && newCost > 0 ? newCost : item.costPerKg;
          const prevCost = newCost !== undefined && newCost > 0 ? item.costPerKg : item.previousCostPerKg;
          const costDiff = newCost !== undefined && newCost > 0 ? newCost - item.costPerKg : item.costDifferencePerKg;
          const newMargin = newRate - cost;
          const marginPct = cost > 0 ? (newMargin / cost) * 100 : 0;
          return {
            ...item,
            costPerKg: cost,
            previousCostPerKg: prevCost,
            costDifferencePerKg: costDiff,
            counterRatePerKg: newRate,
            marginPerKg: Math.round(newMargin * 100) / 100,
            marginPercentage: Math.round(marginPct * 10) / 10
          };
        }
        return item;
      })
    );

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ratePerKg: newRate } : p))
    );
  };

  const addStockInward = (
    id: string,
    additionalKg: number,
    additionalBags: number,
    inwardCostPerKg?: number,
    updatedSellingRate?: number
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const oldKg = item.physicalStockKg;
          const oldBags = item.bagsCount;
          const oldCostPerKg = item.costPerKg;
          const updatedKg = oldKg + additionalKg;
          const updatedBags = oldBags + additionalBags;

          let newCostPerKg = oldCostPerKg;
          let prevCost = item.costPerKg;
          let latestCost = inwardCostPerKg !== undefined ? inwardCostPerKg : oldCostPerKg;
          let costDiff = inwardCostPerKg !== undefined ? inwardCostPerKg - oldCostPerKg : 0;

          if (inwardCostPerKg !== undefined && inwardCostPerKg > 0) {
            // Weighted Average Cost: (Old Stock * Old Cost + New Stock * New Cost) / Total Stock
            const oldValuation = oldKg * oldCostPerKg;
            const inwardValuation = additionalKg * inwardCostPerKg;
            if (updatedKg > 0) {
              newCostPerKg = (oldValuation + inwardValuation) / updatedKg;
            } else {
              newCostPerKg = inwardCostPerKg;
            }
          }

          const sellingRate = updatedSellingRate !== undefined && updatedSellingRate > 0
            ? updatedSellingRate
            : item.counterRatePerKg;
          const newMargin = sellingRate - newCostPerKg;
          const marginPct = newCostPerKg > 0 ? (newMargin / newCostPerKg) * 100 : 0;

          return {
            ...item,
            physicalStockKg: updatedKg,
            bagsCount: updatedBags,
            previousCostPerKg: prevCost,
            latestInwardCostPerKg: latestCost,
            costDifferencePerKg: costDiff,
            costPerKg: Math.round(newCostPerKg * 100) / 100,
            counterRatePerKg: sellingRate,
            marginPerKg: Math.round(newMargin * 100) / 100,
            marginPercentage: Math.round(marginPct * 10) / 10,
            latestInwardDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            lotStatus: updatedKg > 200 ? 'In Stock' : updatedKg > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return item;
      })
    );

    if (updatedSellingRate || additionalKg > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              ratePerKg: updatedSellingRate || p.ratePerKg,
              availableKg: p.availableKg + additionalKg
            };
          }
          return p;
        })
      );
    }
  };

  const updateDenominationCount = (index: number, count: number) => {
    setDenominations((prev) => {
      const copy = [...prev];
      const target = copy[index];
      const newCount = Math.max(0, count);
      copy[index] = {
        ...target,
        count: newCount,
        subtotal: target.denomination * newCount
      };
      return copy;
    });
  };

  const finalizeDayEnd = (): boolean => {
    if (supervisorPin.length >= 4) {
      setIsDayClosed(true);
      setIsDrawerOpen(false);
      localStorage.setItem('ricecms_drawer_active', 'false');
      return true;
    }
    return false;
  };

  return (
    <PosContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        selectedProductForModal,
        setSelectedProductForModal,
        liveScaleWeight,
        setLiveScaleWeight,
        isScaleLocked,
        setIsScaleLocked,
        scaleTare,
        setScaleTare,
        spotDiscount,
        setSpotDiscount,
        paymentMode,
        setPaymentMode,
        cashReceived,
        setCashReceived,
        completeSale,
        memos,
        activeReceipt,
        setActiveReceipt,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateInventoryRate,
        addStockInward,
        denominations,
        updateDenominationCount,
        openingFloat,
        setOpeningFloat,
        isDrawerOpen,
        drawerOpenedAt,
        isOpeningModalOpen,
        setIsOpeningModalOpen,
        openDrawer,
        closeDrawer,
        startNewDay,
        supervisorPin,
        setSupervisorPin,
        handoverNotes,
        setHandoverNotes,
        isDayClosed,
        finalizeDayEnd,
        isTerminalLocked,
        setIsTerminalLocked,
        isMandiChitOpen,
        setIsMandiChitOpen,
        imagePreview,
        setImagePreview,
        openImagePreview,
        closeImagePreview,
        khataCustomers,
        khataTransactions,
        selectedKhataCustomerId,
        setSelectedKhataCustomerId,
        addKhataCustomer,
        updateKhataCustomer,
        deleteKhataCustomer,
        addKhataPurchase,
        addKhataPayment,
        deleteKhataTransaction,
        language,
        setLanguage
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
