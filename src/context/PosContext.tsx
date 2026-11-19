import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  Product,
  CartItem,
  MemoRecord,
  PaymentMode,
  InventoryItem,
  DenominationRow,
  ImagePreviewData,
  KhataCustomer,
  KhataTransaction,
  KhataItemEntry
} from '../types';
import type { TerminalUser } from '../components/users/AddUserModal';
import { INITIAL_DENOMINATIONS } from '../data/mockData';
import {
  auth,
  onAuthStateChanged,
  logoutFirebase,
  type FirebaseUser
} from '../service/firebaseClient';
import {
  subscribeToInventory,
  subscribeToProducts,
  subscribeToMemos,
  subscribeToKhataCustomers,
  subscribeToKhataTransactions,
  subscribeToCashDrawer,
  addInventoryItemDoc,
  updateInventoryItemDoc,
  deleteInventoryItemDoc,
  addStockInwardDoc,
  createMemoDoc,
  deleteMemoDoc,
  updateMemoDoc,
  addKhataCustomerDoc,
  updateKhataCustomerDoc,
  deleteKhataCustomerDoc,
  addKhataTransactionDoc,
  deleteKhataTransactionDoc,
  saveCashDrawerOpeningDoc,
  closeCashDrawerDoc,
  saveDayClosingDoc,
  getOrCreateUserDoc,
  clearMockDataIfPresent
} from '../service/firestoreService';
import { getPakistanDateIso, parseDateStrToIso } from '../utils/dateUtils';

interface PosContextType {
  // Authentication & Logged In User
  currentUser: FirebaseUser | null;
  userProfile: TerminalUser | null;
  isAuthLoading: boolean;
  logout: () => Promise<void>;
  // Products & Cart
  products: Product[];
  isProductsLoading: boolean;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemRate: (id: string, newRate: number) => void;
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
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
  selectedKhataCustomerForBill: KhataCustomer | null;
  setSelectedKhataCustomerForBill: (cust: KhataCustomer | null) => void;
  cashReceived: number;
  setCashReceived: (val: number) => void;
  completeSale: (options?: {
    khataCustomer?: KhataCustomer | null;
    partialCash?: number;
    customPaymentMode?: PaymentMode;
  }) => MemoRecord | null;
  memos: MemoRecord[];
  isMemosLoading: boolean;
  activeReceipt: MemoRecord | null;
  setActiveReceipt: (rec: MemoRecord | null) => void;
  deleteMemo: (memoId: string) => Promise<void>;
  updateMemo: (updatedMemo: MemoRecord) => Promise<void>;
  reloadMemoToCart: (memoId: string) => Promise<void>;

  // Inventory & Product CRUD
  inventory: InventoryItem[];
  isInventoryLoading: boolean;
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
  isPreviousSessionUnclosed: boolean;
  isUnclosedModalOpen: boolean;
  setIsUnclosedModalOpen: (open: boolean) => void;
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
  isCustomersLoading: boolean;
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<TerminalUser | null>(() => {
    const saved = localStorage.getItem('ricecms_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(() => {
    return localStorage.getItem('ricecms_auth_active') !== 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    return localStorage.getItem('ricecms_auth_active') !== 'true';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_products');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Live scale
  const [liveScaleWeight, setLiveScaleWeight] = useState<number>(0.00);
  const [isScaleLocked, setIsScaleLocked] = useState<boolean>(true);
  const [scaleTare, setScaleTare] = useState<number>(0.00);

  // Checkout
  const [spotDiscount, setSpotDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('SPOT CASH');
  const [selectedKhataCustomerForBill, setSelectedKhataCustomerForBill] = useState<KhataCustomer | null>(null);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [memos, setMemos] = useState<MemoRecord[]>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_memos');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isMemosLoading, setIsMemosLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_memos');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const memosRef = useRef<MemoRecord[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<MemoRecord | null>(null);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_inventory');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isInventoryLoading, setIsInventoryLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_inventory');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  // Helper to verify if an ISO date string matches today in Pakistan Standard Time (PKT)
  const isDateToday = (isoStr: string | null): boolean => {
    if (!isoStr) return false;
    try {
      const todayPkt = getPakistanDateIso();
      const targetDate = isoStr.includes('T') ? isoStr.split('T')[0] : parseDateStrToIso(isoStr);
      return targetDate === todayPkt;
    } catch {
      return false;
    }
  };

  // Day-End & Cash Drawer Opening
  const [denominations, setDenominations] = useState<DenominationRow[]>(INITIAL_DENOMINATIONS);

  useEffect(() => {
    // Ensure all 8 denominations (including PKR 20, PKR 10) are present
    setDenominations((prev) => {
      if (prev.length < INITIAL_DENOMINATIONS.length) {
        return INITIAL_DENOMINATIONS.map((initDeno) => {
          const existing = prev.find((p) => p.denomination === initDeno.denomination);
          return existing ? existing : initDeno;
        });
      }
      return prev;
    });
  }, []);
  const [openingFloat, setOpeningFloatState] = useState<number>(() => {
    const savedActive = localStorage.getItem('ricecms_drawer_active');
    if (savedActive !== 'true') return 0;
    const saved = localStorage.getItem('ricecms_opening_float');
    return saved ? parseFloat(saved) : 0;
  });

  const [drawerOpenedAt, setDrawerOpenedAt] = useState<string | null>(() => {
    return localStorage.getItem('ricecms_drawer_opened_at');
  });

  const [isPreviousSessionUnclosed, setIsPreviousSessionUnclosed] = useState<boolean>(false);
  const [isUnclosedModalOpen, setIsUnclosedModalOpen] = useState<boolean>(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    try {
      const savedDate = localStorage.getItem('ricecms_drawer_date');
      const todayPkt = getPakistanDateIso();
      const savedActive = localStorage.getItem('ricecms_drawer_active');
      if (savedActive === 'true' && savedDate === todayPkt) {
        return true;
      }
      return savedActive === 'true';
    } catch {
      return false;
    }
  });

  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState<boolean>(false);

  const setOpeningFloat = (val: number) => {
    setOpeningFloatState(val);
    localStorage.setItem('ricecms_opening_float', val.toString());
  };

  const openDrawer = (amount: number, cashierName?: string, notes?: string) => {
    const todayStr = getPakistanDateIso();
    const now = new Date().toISOString();
    setOpeningFloatState(amount);
    setIsDrawerOpen(true);
    setIsDayClosed(false);
    setIsPreviousSessionUnclosed(false);
    setIsUnclosedModalOpen(false);
    setDrawerOpenedAt(now);
    setIsOpeningModalOpen(false);
    localStorage.setItem('ricecms_opening_float', amount.toString());
    localStorage.setItem('ricecms_drawer_active', 'true');
    localStorage.setItem('ricecms_drawer_opened_at', now);
    localStorage.setItem('ricecms_drawer_date', todayStr);
    saveCashDrawerOpeningDoc(amount, now, cashierName, notes).catch(console.error);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsPreviousSessionUnclosed(false);
    setIsUnclosedModalOpen(false);
    localStorage.setItem('ricecms_drawer_active', 'false');
    closeCashDrawerDoc().catch(console.error);
  };

  const startNewDay = () => {
    setIsDayClosed(false);
    setIsDrawerOpen(false);
    setIsPreviousSessionUnclosed(false);
    setIsUnclosedModalOpen(false);
    localStorage.setItem('ricecms_drawer_active', 'false');
    setOpeningFloatState(0);
    setDenominations(INITIAL_DENOMINATIONS);
    setCart([]);
    setSupervisorPin('');
    setHandoverNotes('');
    setIsOpeningModalOpen(true);
  };

  const [supervisorPin, setSupervisorPin] = useState<string>('');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
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
  const [khataCustomers, setKhataCustomers] = useState<KhataCustomer[]>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_khata_customers');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isCustomersLoading, setIsCustomersLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('ricecms_cached_khata_customers');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>([]);
  const [selectedKhataCustomerId, setSelectedKhataCustomerId] = useState<string | null>(null);

  const logout = async () => {
    try {
      localStorage.removeItem('ricecms_auth_active');
      localStorage.removeItem('ricecms_user_profile');
      await logoutFirebase();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsTerminalLocked(true);
  };

  // Synchronize Firebase Auth & Firestore in real time
  useEffect(() => {
    // Clean any legacy mock data from Firestore
    clearMockDataIfPresent().catch((err) => {
      console.warn('Mock cleanup notice:', err);
    });

    // Listen to Firebase Authentication State
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        localStorage.setItem('ricecms_auth_active', 'true');
        setCurrentUser(fbUser);
        setIsTerminalLocked(false);
        try {
          const profile = await getOrCreateUserDoc(fbUser);
          setUserProfile(profile);
          if (profile) {
            localStorage.setItem('ricecms_user_profile', JSON.stringify(profile));
          }
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        localStorage.removeItem('ricecms_auth_active');
        localStorage.removeItem('ricecms_user_profile');
        setCurrentUser(null);
        setUserProfile(null);
        setIsTerminalLocked(true);
      }
      setIsAuthLoading(false);
    });

    // Live Firestore Subscriptions (Clean direct sync, no mock fallback)
    const unsubInv = subscribeToInventory((items) => {
      setInventory(items || []);
      setIsInventoryLoading(false);
      try {
        localStorage.setItem('ricecms_cached_inventory', JSON.stringify(items || []));
      } catch (_) {}
    });

    const unsubProds = subscribeToProducts((prods) => {
      setProducts(prods || []);
      setIsProductsLoading(false);
      try {
        localStorage.setItem('ricecms_cached_products', JSON.stringify(prods || []));
      } catch (_) {}
    });

    const unsubMemos = subscribeToMemos((memosList) => {
      memosRef.current = memosList || [];
      setMemos(memosList || []);
      setIsMemosLoading(false);
      try {
        localStorage.setItem('ricecms_cached_memos', JSON.stringify(memosList || []));
      } catch (_) {}
    });

    const unsubCusts = subscribeToKhataCustomers((custs) => {
      // Auto-correct any customer whose opening balance was doubled due to previous firestore update
      const sanitized = (custs || []).map((c) => {
        if (c.shopName.toLowerCase().includes('ali clinic') && c.currentBalance === 400 && c.totalCredit === 0) {
          updateKhataCustomerDoc(c.id, { totalDebit: 200, currentBalance: 200 }).catch(console.error);
          return { ...c, totalDebit: 200, currentBalance: 200 };
        }
        return c;
      });
      setKhataCustomers(sanitized);
      setIsCustomersLoading(false);
      try {
        localStorage.setItem('ricecms_cached_khata_customers', JSON.stringify(sanitized || []));
      } catch (_) {}
      if (sanitized && sanitized.length > 0) {
        setSelectedKhataCustomerId((prev) => prev || sanitized[0].id);
      }
    });

    const unsubTxs = subscribeToKhataTransactions((txs) => {
      setKhataTransactions(txs || []);
    });

    const unsubDrawer = subscribeToCashDrawer((d) => {
      if (d) {
        const todayPkt = getPakistanDateIso();
        const openedDate = d.drawerOpenedAt
          ? (d.drawerOpenedAt.includes('T') ? d.drawerOpenedAt.split('T')[0] : parseDateStrToIso(d.drawerOpenedAt))
          : null;
        const isToday = openedDate === todayPkt;

        if (d.isDrawerOpen && isToday) {
          // Active drawer for today - keep open across reloads and tab navigations
          setOpeningFloatState(d.openingFloat || 0);
          setDrawerOpenedAt(d.drawerOpenedAt || null);
          setIsDrawerOpen(true);
          setIsOpeningModalOpen(false);
          setIsPreviousSessionUnclosed(false);
          setIsUnclosedModalOpen(false);
          localStorage.setItem('ricecms_drawer_active', 'true');
          localStorage.setItem('ricecms_drawer_date', todayPkt);
          localStorage.setItem('ricecms_opening_float', (d.openingFloat || 0).toString());
          if (d.drawerOpenedAt) {
            localStorage.setItem('ricecms_drawer_opened_at', d.drawerOpenedAt);
          }
          return;
        }

        if (d.isDrawerOpen && !isToday && d.drawerOpenedAt) {
          // Drawer was opened on a previous day and not closed
          if (memosRef.current.length > 0) {
            setIsPreviousSessionUnclosed(true);
            setIsUnclosedModalOpen(true);
            setIsDrawerOpen(false);
          } else {
            // Clean reset if there were no memos recorded
            closeCashDrawerDoc().catch(console.error);
            setIsPreviousSessionUnclosed(false);
            setIsUnclosedModalOpen(false);
            setIsDrawerOpen(false);
            localStorage.setItem('ricecms_drawer_active', 'false');
            localStorage.removeItem('ricecms_drawer_opened_at');
            localStorage.removeItem('ricecms_drawer_date');
          }
          return;
        }

        if (!d.isDrawerOpen) {
          // Fallback: check if opened locally today
          const localActive = localStorage.getItem('ricecms_drawer_active') === 'true';
          const localDate = localStorage.getItem('ricecms_drawer_date');
          if (localActive && localDate === todayPkt) {
            setIsDrawerOpen(true);
            setIsOpeningModalOpen(false);
            return;
          }

          setOpeningFloatState(0);
          setDrawerOpenedAt(null);
          setIsDrawerOpen(false);
          setIsPreviousSessionUnclosed(false);
          setIsUnclosedModalOpen(false);
          localStorage.setItem('ricecms_drawer_active', 'false');
          localStorage.setItem('ricecms_opening_float', '0');
          localStorage.removeItem('ricecms_drawer_opened_at');
          localStorage.removeItem('ricecms_drawer_date');
        }
      }
    });

    return () => {
      unsubAuth();
      unsubInv();
      unsubProds();
      unsubMemos();
      unsubCusts();
      unsubTxs();
      unsubDrawer();
    };
  }, []);

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

    // Persist to Firestore
    addKhataCustomerDoc(newCust).catch(console.error);

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
      addKhataTransactionDoc(openTx).catch(console.error);
    }

    return newCust;
  };

  const updateKhataCustomer = (id: string, updated: Partial<KhataCustomer>) => {
    setKhataCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    updateKhataCustomerDoc(id, updated).catch(console.error);
  };

  const deleteKhataCustomer = (id: string) => {
    setKhataCustomers((prev) => prev.filter((c) => c.id !== id));
    setKhataTransactions((prev) => prev.filter((tx) => tx.customerId !== id));
    if (selectedKhataCustomerId === id) {
      const remaining = khataCustomers.filter((c) => c.id !== id);
      setSelectedKhataCustomerId(remaining[0]?.id || null);
    }
    deleteKhataCustomerDoc(id).catch(console.error);
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

    addKhataTransactionDoc(newTx).catch(console.error);
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

    addKhataTransactionDoc(newTx).catch(console.error);
  };

  const deleteKhataTransaction = (txId: string) => {
    const tx = khataTransactions.find((t) => t.id === txId);
    if (!tx) return;

    setKhataTransactions((prev) => prev.filter((t) => t.id !== txId));

    setKhataCustomers((prev) =>
      prev.map((c) => {
        if (c.id === tx.customerId) {
          const newDebit = (tx.type === 'PURCHASE' || tx.type === 'OPENING_BALANCE') ? c.totalDebit - tx.debit : c.totalDebit;
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

    deleteKhataTransactionDoc(tx.id, tx.customerId, tx.debit || 0, tx.credit || 0, tx.type).catch(console.error);
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItemRate = (id: string, newRate: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validRate = Math.max(0, newRate);
          return {
            ...item,
            ratePerKg: validRate,
            subtotal: Math.round(item.netWeight * validRate)
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setSpotDiscount(0);
  };

  const completeSale = (options?: {
    khataCustomer?: KhataCustomer | null;
    partialCash?: number;
    customPaymentMode?: PaymentMode;
  }): MemoRecord | null => {
    if (cart.length === 0) return null;

    const gross = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const net = gross - spotDiscount;
    const totalWeight = cart.reduce((sum, item) => sum + item.netWeight, 0);

    const now = new Date();
    const maxSeq = memos.reduce((max, m) => {
      const num = parseInt(m.memoNo.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const memoSeq = String(Math.max(memos.length, maxSeq) + 1).padStart(4, '0');
    const memoId = `memo-${memoSeq}`;

    const cashierLabel = userProfile
      ? (language === 'ur' ? userProfile.urduName || userProfile.name : userProfile.name)
      : currentUser?.displayName || currentUser?.email?.split('@')[0] || (language === 'ur' ? 'کیشیئر' : 'Cashier');

    const effectivePaymentMode = options?.customPaymentMode || paymentMode;
    const targetKhataCust = options?.khataCustomer !== undefined ? options.khataCustomer : selectedKhataCustomerForBill;
    const isKhata = effectivePaymentMode === 'KHATA / CREDIT' || Boolean(targetKhataCust && effectivePaymentMode !== 'SPOT CASH' && effectivePaymentMode !== 'RAAST ONLINE');

    let customerName = 'Counter Retail Buyer';
    let customerMeta = 'Spot Cash • Counter 01';
    let finalPaymentMode: PaymentMode = effectivePaymentMode;
    let khataCustId: string | undefined = undefined;

    if (isKhata && targetKhataCust) {
      finalPaymentMode = 'KHATA / CREDIT';
      khataCustId = targetKhataCust.id;
      const shop = targetKhataCust.shopName?.trim();
      const person = targetKhataCust.customerName?.trim();
      customerName = shop ? `${shop}${person && person !== shop ? ` (${person})` : ''}` : (person || 'Khata Customer');
      customerMeta = `Khata Account • ${targetKhataCust.phone || 'Udhar'}`;
    }

    const newRecord: MemoRecord = {
      id: memoId,
      memoNo: `#${memoSeq}`,
      dateStr: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} PKT`,
      customerName,
      customerMeta,
      itemsSummary: cart.map((c) => c.product.name).join(' + '),
      weightSummary: `${cart.length} Items (${totalWeight.toFixed(2)} KG)`,
      paymentMode: finalPaymentMode,
      grossAmount: gross,
      discount: spotDiscount,
      netAmount: net,
      items: [...cart],
      cashier: cashierLabel,
      counterId: 'Counter 01',
      khataCustomerId: khataCustId
    };

    setMemos([newRecord, ...memos]);
    setActiveReceipt(newRecord);

    // If Khata sale, automatically record purchase to customer's Khata ledger
    if (finalPaymentMode === 'KHATA / CREDIT' && targetKhataCust) {
      const itemSummary = cart
        .map((c) => `${c.product.urduName || c.product.name} (${c.netWeight < 1 ? c.netWeight.toFixed(3) : c.netWeight.toFixed(2)} ${c.mode === 'packet' ? 'pkt' : 'kg'})`)
        .join(', ');

      const desc = language === 'ur'
        ? `کیش میمو ${newRecord.memoNo} (کاؤنٹر بل) - ${itemSummary}`
        : `Cash Memo ${newRecord.memoNo} (POS Counter Bill) - ${itemSummary}`;

      const khataItems: KhataItemEntry[] = cart.map((c) => ({
        productName: c.product.name,
        urduName: c.product.urduName,
        quantity: c.netWeight,
        unit: c.mode === 'packet' ? 'packet' : 'kg',
        rate: c.ratePerKg,
        subtotal: c.subtotal
      }));

      addKhataPurchase(
        targetKhataCust.id,
        net,
        desc,
        khataItems,
        `POS Counter Memo ${newRecord.memoNo}. Spot Discount: PKR ${spotDiscount}`
      );

      const partial = options?.partialCash || 0;
      if (partial > 0) {
        addKhataPayment(
          targetKhataCust.id,
          partial,
          'CASH',
          language === 'ur'
            ? `برائے میمو ${newRecord.memoNo} کے موقع پر نقد وصولی (Spot Cash on Counter)`
            : `Cash paid on spot for Memo ${newRecord.memoNo}`,
          newRecord.memoNo
        );
      }

      setSelectedKhataCustomerForBill(null);
    }

    clearCart();

    // Persist to Firestore and decrement stock in real time
    createMemoDoc(newRecord).catch(console.error);

    return newRecord;
  };

  const deleteMemo = async (memoId: string): Promise<void> => {
    const target = memos.find((m) => m.id === memoId);
    if (!target) return;

    // 1. Remove from local memos state
    setMemos((prev) => prev.filter((m) => m.id !== memoId));
    if (activeReceipt?.id === memoId) {
      setActiveReceipt(null);
    }

    // 2. Restore stock locally for sold items
    if (target.items && target.items.length > 0) {
      setInventory((prev) =>
        prev.map((invItem) => {
          const totalSold = target.items
            .filter(
              (it) =>
                it.product?.id === invItem.id ||
                (it.product?.name && it.product.name.trim().toLowerCase() === invItem.varietyName.trim().toLowerCase())
            )
            .reduce((sum, it) => sum + (it.netWeight || 0), 0);

          if (totalSold > 0) {
            const restoredQty = invItem.physicalStockKg + totalSold;
            const bagsRestored = Math.floor(totalSold / 50);
            const newBags = invItem.bagsCount + bagsRestored;
            const threshold = invItem.minStockThreshold !== undefined ? invItem.minStockThreshold : 20;
            return {
              ...invItem,
              physicalStockKg: Math.round(restoredQty * 100) / 100,
              bagsCount: newBags,
              lotStatus: restoredQty <= 0 ? 'Out of Stock' : restoredQty <= (threshold / 2) ? 'Critical Low' : restoredQty <= threshold ? 'Low Stock' : 'In Stock'
            };
          }
          return invItem;
        })
      );

      setProducts((prev) =>
        prev.map((prod) => {
          const totalSold = target.items
            .filter(
              (it) =>
                it.product?.id === prod.id ||
                (it.product?.name && it.product.name.trim().toLowerCase() === prod.name.trim().toLowerCase())
            )
            .reduce((sum, it) => sum + (it.netWeight || 0), 0);

          if (totalSold > 0) {
            const restoredAvail = prod.availableKg + totalSold;
            const threshold = prod.minStockThreshold !== undefined ? prod.minStockThreshold : 20;
            return {
              ...prod,
              availableKg: Math.round(restoredAvail * 100) / 100,
              availableStockLabel: `${Math.round(restoredAvail)} KG`,
              isLowStock: restoredAvail <= threshold
            };
          }
          return prod;
        })
      );
    }

    // 3. If Khata memo, reverse Khata ledger and customer balance
    if (target.paymentMode === 'KHATA / CREDIT' && target.khataCustomerId) {
      const custId = target.khataCustomerId;
      const cust = khataCustomers.find((c) => c.id === custId);
      if (cust) {
        const reversedBalance = Math.max(0, cust.currentBalance - target.netAmount);
        setKhataCustomers((prev) =>
          prev.map((c) => {
            if (c.id === custId) {
              return {
                ...c,
                totalDebit: Math.max(0, c.totalDebit - target.netAmount),
                currentBalance: reversedBalance,
                status: reversedBalance > 0 ? 'ACTIVE' : 'SETTLED'
              };
            }
            return c;
          })
        );
        const relatedTx = khataTransactions.find(
          (t) => t.customerId === custId && (t.description.includes(target.memoNo) || t.notes?.includes(target.memoNo))
        );
        if (relatedTx) {
          deleteKhataTransaction(relatedTx.id);
        }
      }
    }

    // 4. Persist deletion and stock restoration to Firestore
    await deleteMemoDoc(memoId, target.items);
  };

  const updateMemo = async (updatedMemo: MemoRecord): Promise<void> => {
    const oldMemo = memos.find((m) => m.id === updatedMemo.id);
    if (!oldMemo) return;

    // Calculate stock adjustments: weightDiff = newWeight - oldWeight
    const stockAdjustments: { productId: string; weightDiff: number }[] = [];

    for (const oldItem of oldMemo.items) {
      const newItem = updatedMemo.items.find((it) => it.id === oldItem.id || it.product.id === oldItem.product.id);
      const newWeight = newItem ? newItem.netWeight : 0;
      const diff = newWeight - oldItem.netWeight;
      if (diff !== 0) {
        stockAdjustments.push({ productId: oldItem.product.id, weightDiff: diff });
      }
    }

    for (const newItem of updatedMemo.items) {
      const existedInOld = oldMemo.items.some((it) => it.id === newItem.id || it.product.id === newItem.product.id);
      if (!existedInOld) {
        stockAdjustments.push({ productId: newItem.product.id, weightDiff: newItem.netWeight });
      }
    }

    // 1. Update local memos state
    setMemos((prev) => prev.map((m) => (m.id === updatedMemo.id ? updatedMemo : m)));
    if (activeReceipt?.id === updatedMemo.id) {
      setActiveReceipt(updatedMemo);
    }

    // 2. Adjust local inventory & products
    if (stockAdjustments.length > 0) {
      setInventory((prev) =>
        prev.map((invItem) => {
          const adj = stockAdjustments.find((a) => a.productId === invItem.id);
          if (adj) {
            const newQty = Math.max(0, invItem.physicalStockKg - adj.weightDiff);
            const threshold = invItem.minStockThreshold !== undefined ? invItem.minStockThreshold : 20;
            return {
              ...invItem,
              physicalStockKg: Math.round(newQty * 100) / 100,
              lotStatus: newQty <= 0 ? 'Out of Stock' : newQty <= (threshold / 2) ? 'Critical Low' : newQty <= threshold ? 'Low Stock' : 'In Stock'
            };
          }
          return invItem;
        })
      );

      setProducts((prev) =>
        prev.map((prod) => {
          const adj = stockAdjustments.find((a) => a.productId === prod.id);
          if (adj) {
            const newAvail = Math.max(0, prod.availableKg - adj.weightDiff);
            const threshold = prod.minStockThreshold !== undefined ? prod.minStockThreshold : 20;
            return {
              ...prod,
              availableKg: Math.round(newAvail * 100) / 100,
              availableStockLabel: `${Math.round(newAvail)} KG`,
              isLowStock: newAvail <= threshold
            };
          }
          return prod;
        })
      );
    }

    // 3. Persist to Firestore
    await updateMemoDoc(updatedMemo, stockAdjustments);
  };

  const reloadMemoToCart = async (memoId: string): Promise<void> => {
    const target = memos.find((m) => m.id === memoId);
    if (!target) return;

    // Load items into active cart
    setCart([...target.items]);
    setSpotDiscount(target.discount || 0);
    setPaymentMode(target.paymentMode || 'SPOT CASH');

    // Delete the old memo and restore stock
    await deleteMemo(memoId);
  };

  const addInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);

    // Also create or sync product in POS Counter
    const categoryMapping: string = newItem.category || 'Rice (چاول)';
    const threshold = newItem.minStockThreshold !== undefined ? newItem.minStockThreshold : 20;

    const newProd: Product = {
      id: newItem.id,
      name: newItem.varietyName,
      urduName: newItem.urduName,
      category: categoryMapping,
      badgeLabel: newItem.category.toUpperCase(),
      ratePerKg: newItem.counterRatePerKg,
      costPerKg: newItem.costPerKg,
      availableKg: newItem.physicalStockKg,
      binLocation: 'Godown Stack',
      imageUrl: newItem.imageUrl,
      shortcut: `F${100 + inventory.length + 1}`,
      tareWeightDefault: newItem.tareDeductionKg || 0.10,
      minStockThreshold: threshold,
      isLowStock: newItem.physicalStockKg <= threshold
    };
    setProducts((prev) => [...prev, newProd]);

    // Persist to Firestore
    addInventoryItemDoc(newItem).catch(console.error);
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
          const threshold = updated.minStockThreshold !== undefined
            ? updated.minStockThreshold
            : (item.minStockThreshold !== undefined ? item.minStockThreshold : 20);
          const computedLotStatus = updated.lotStatus || (kg <= 0
            ? 'Out of Stock'
            : kg <= (threshold / 2)
              ? 'Critical Low'
              : kg <= threshold
                ? 'Low Stock'
                : 'In Stock');
          return {
            ...item,
            ...updated,
            costPerKg: cost,
            counterRatePerKg: rate,
            marginPerKg: Math.round(margin * 100) / 100,
            marginPercentage: Math.round(marginPct * 10) / 10,
            minStockThreshold: threshold,
            lotStatus: computedLotStatus
          };
        }
        return item;
      })
    );

    // Keep products synchronized
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newAvail = updated.physicalStockKg !== undefined ? updated.physicalStockKg : p.availableKg;
          const threshold = updated.minStockThreshold !== undefined
            ? updated.minStockThreshold
            : (p.minStockThreshold !== undefined ? p.minStockThreshold : 20);
          return {
            ...p,
            name: updated.varietyName || p.name,
            urduName: updated.urduName || p.urduName,
            ratePerKg: updated.counterRatePerKg !== undefined ? updated.counterRatePerKg : p.ratePerKg,
            costPerKg: updated.costPerKg !== undefined ? updated.costPerKg : p.costPerKg,
            availableKg: newAvail,
            imageUrl: updated.imageUrl !== undefined ? updated.imageUrl : p.imageUrl,
            minStockThreshold: threshold,
            isLowStock: newAvail <= threshold
          };
        }
        return p;
      })
    );

    // Persist to Firestore
    updateInventoryItemDoc(id, updated).catch(console.error);
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteInventoryItemDoc(id).catch(console.error);
  };

  const updateInventoryRate = (id: string, newRate: number, newCost?: number) => {
    let updatedItemProps: Partial<InventoryItem> = {};
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cost = newCost !== undefined && newCost > 0 ? newCost : item.costPerKg;
          const prevCost = newCost !== undefined && newCost > 0 ? item.costPerKg : item.previousCostPerKg;
          const costDiff = newCost !== undefined && newCost > 0 ? newCost - item.costPerKg : item.costDifferencePerKg;
          const newMargin = newRate - cost;
          const marginPct = cost > 0 ? (newMargin / cost) * 100 : 0;
          updatedItemProps = {
            costPerKg: cost,
            previousCostPerKg: prevCost,
            costDifferencePerKg: costDiff,
            counterRatePerKg: newRate,
            marginPerKg: Math.round(newMargin * 100) / 100,
            marginPercentage: Math.round(marginPct * 10) / 10
          };
          return {
            ...item,
            ...updatedItemProps
          };
        }
        return item;
      })
    );

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ratePerKg: newRate } : p))
    );

    updateInventoryItemDoc(id, updatedItemProps).catch(console.error);
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
            lotStatus: updatedKg <= 0 ? 'Out of Stock' : updatedKg <= (item.minStockThreshold ?? 20) ? 'Low Stock' : 'In Stock'
          };
        }
        return item;
      })
    );

    if (updatedSellingRate || additionalKg > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const newAvail = p.availableKg + additionalKg;
            const threshold = p.minStockThreshold !== undefined ? p.minStockThreshold : 20;
            return {
              ...p,
              ratePerKg: updatedSellingRate || p.ratePerKg,
              availableKg: newAvail,
              isLowStock: newAvail <= threshold
            };
          }
          return p;
        })
      );
    }

    addStockInwardDoc(id, additionalKg, additionalBags, inwardCostPerKg, updatedSellingRate).catch(console.error);
  };

  const updateDenominationCount = (index: number, count: number) => {
    setDenominations((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (!target) return prev;
      const newCount = Math.max(0, count);
      copy[index] = {
        ...target,
        count: newCount,
        subtotal: target.denomination === 0 ? newCount : target.denomination * newCount
      };
      return copy;
    });
  };

  const finalizeDayEnd = (): boolean => {
    if (supervisorPin.trim().length > 0) {
      setIsDayClosed(true);
      setIsDrawerOpen(false);
      setIsPreviousSessionUnclosed(false);
      setIsUnclosedModalOpen(false);
      localStorage.setItem('ricecms_drawer_active', 'false');
      localStorage.removeItem('ricecms_drawer_opened_at');
      localStorage.setItem('ricecms_opening_float', '0');
      setOpeningFloatState(0);
      setDrawerOpenedAt(null);
      setCart([]);

      // Persist day closing record to Firestore
      saveDayClosingDoc({
        closedAt: new Date().toISOString(),
        openingFloat,
        denominations,
        handoverNotes,
        supervisorPin,
        memosCount: memos.length
      }).catch(console.error);

      // Close drawer in Firestore so next session starts fresh with clean 0 float
      closeCashDrawerDoc().catch(console.error);

      return true;
    }
    return false;
  };

  return (
    <PosContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthLoading,
        logout,
        products,
        isProductsLoading,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemRate,
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
        selectedKhataCustomerForBill,
        setSelectedKhataCustomerForBill,
        cashReceived,
        setCashReceived,
        completeSale,
        memos,
        isMemosLoading,
        activeReceipt,
        setActiveReceipt,
        deleteMemo,
        updateMemo,
        reloadMemoToCart,
        inventory,
        isInventoryLoading,
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
        isPreviousSessionUnclosed,
        isUnclosedModalOpen,
        setIsUnclosedModalOpen,
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
        isCustomersLoading,
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
