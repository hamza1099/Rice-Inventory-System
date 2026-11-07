import React, { createContext, useContext, useState } from 'react';
import type { Product, CartItem, MemoRecord, InventoryItem, DenominationRow } from '../types';
import { INITIAL_PRODUCTS, INITIAL_MEMOS, INITIAL_INVENTORY, INITIAL_DENOMINATIONS } from '../data/mockData';

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

  // Inventory
  inventory: InventoryItem[];
  updateInventoryRate: (id: string, newRate: number) => void;
  addStockInward: (id: string, additionalKg: number, additionalBags: number) => void;

  // Day-End Reconciliation
  denominations: DenominationRow[];
  updateDenominationCount: (index: number, count: number) => void;
  openingFloat: number;
  supervisorPin: string;
  setSupervisorPin: (pin: string) => void;
  handoverNotes: string;
  setHandoverNotes: (notes: string) => void;
  isDayClosed: boolean;
  finalizeDayEnd: () => boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  
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
  const [spotDiscount, setSpotDiscount] = useState<number>(140);
  const [paymentMode, setPaymentMode] = useState<'SPOT CASH' | 'RAAST ONLINE'>('SPOT CASH');
  const [cashReceived, setCashReceived] = useState<number>(7000);
  const [memos, setMemos] = useState<MemoRecord[]>(INITIAL_MEMOS);
  const [activeReceipt, setActiveReceipt] = useState<MemoRecord | null>(null);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Day-End
  const [denominations, setDenominations] = useState<DenominationRow[]>(INITIAL_DENOMINATIONS);
  const [openingFloat] = useState<number>(15000);
  const [supervisorPin, setSupervisorPin] = useState<string>('9921');
  const [handoverNotes, setHandoverNotes] = useState<string>(
    'All spot memos cleared, zero credit given. Cash ready for godown safe handover.'
  );
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
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

  const updateInventoryRate = (id: string, newRate: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newMargin = newRate - item.costPerKg;
          return { ...item, counterRatePerKg: newRate, marginPerKg: newMargin };
        }
        return item;
      })
    );
  };

  const addStockInward = (id: string, additionalKg: number, additionalBags: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedKg = item.physicalStockKg + additionalKg;
          const updatedBags = item.bagsCount + additionalBags;
          return {
            ...item,
            physicalStockKg: updatedKg,
            bagsCount: updatedBags,
            lotStatus: updatedKg > 200 ? 'In Stock' : 'Low Stock'
          };
        }
        return item;
      })
    );
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
        updateInventoryRate,
        addStockInward,
        denominations,
        updateDenominationCount,
        openingFloat,
        supervisorPin,
        setSupervisorPin,
        handoverNotes,
        setHandoverNotes,
        isDayClosed,
        finalizeDayEnd
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
