import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebaseClient';
import type {
  Product,
  CartItem,
  InventoryItem,
  MemoRecord,
  KhataCustomer,
  KhataTransaction,
  Supplier,
  SupplierTransaction
} from '../types';
import type { TerminalUser } from '../components/users/AddUserModal';
// Collection references
const INVENTORY_COLLECTION = 'inventory';
const PRODUCTS_COLLECTION = 'products';
const MEMOS_COLLECTION = 'memos';
const KHATA_CUSTOMERS_COLLECTION = 'khata_customers';
const KHATA_TRANSACTIONS_COLLECTION = 'khata_transactions';
const SUPPLIERS_COLLECTION = 'suppliers';
const SUPPLIER_TRANSACTIONS_COLLECTION = 'supplier_transactions';
const USERS_COLLECTION = 'users';
const CASH_DRAWER_COLLECTION = 'cash_drawer';
const DAY_CLOSINGS_COLLECTION = 'day_closings';

// =========================================================================
// 1. INVENTORY & PRODUCTS CRUD + REAL-TIME LISTENERS
// =========================================================================

export const subscribeToInventory = (callback: (items: InventoryItem[]) => void) => {
  const colRef = collection(db, INVENTORY_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<InventoryItem, 'id'>)
      }));
      callback(items);
    },
    (err) => {
      console.error('Error in subscribeToInventory:', err);
    }
  );
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, 'id'>)
      }));
      callback(items);
    },
    (err) => {
      console.error('Error in subscribeToProducts:', err);
    }
  );
};

export const addInventoryItemDoc = async (item: InventoryItem): Promise<void> => {
  const docRef = doc(db, INVENTORY_COLLECTION, item.id);
  await setDoc(docRef, {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Also sync to POS products collection
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, item.id);
  const resolvedUnitLabel = item.unitLabel || (item.unitType === 'piece' ? '/ pc' : item.unitType === 'liter' ? '/ liter' : '/ kg');
  const isLoose = item.packagingStandard?.includes('Loose') || item.packagingStandard?.includes('Minor') || item.packagingStandard === 'loose_minor';
  const availableStockLabel = item.unitType === 'piece'
    ? `${item.physicalStockKg} Pcs`
    : item.unitType === 'liter'
      ? `${item.physicalStockKg} L`
      : (item.physicalStockKg < 1
        ? `${Math.round(item.physicalStockKg * 1000)}g (${item.physicalStockKg} kg)`
        : `${item.physicalStockKg} KG`);

  const isWholesalePack = !isLoose && Boolean(item.unitsPerPack && item.unitsPerPack > 1);
  const wholesaleBoriPrice = isLoose ? item.counterRatePerKg : item.counterRatePerBag;
  const boriWeightKg = isLoose ? 1 : (item.unitsPerPack || 25);

  const newProduct: Product = {
    id: item.id,
    name: item.varietyName,
    urduName: item.urduName,
    category: item.category || 'Rice',
    badgeLabel: item.category ? item.category.toUpperCase().slice(0, 12) : 'GRAIN',
    ratePerKg: item.counterRatePerKg,
    costPerKg: item.costPerKg,
    unitLabel: resolvedUnitLabel,
    availableKg: item.physicalStockKg,
    availableStockLabel,
    binLocation: item.packagingStandard || 'Godown Bay A',
    imageUrl: item.imageUrl || '',
    shortcut: `F${Math.floor(100 + Math.random() * 899)}`,
    tareWeightDefault: item.tareDeductionKg ?? 0.0,
    minStockThreshold: item.minStockThreshold ?? 20,
    isLowStock: item.physicalStockKg <= (item.minStockThreshold ?? 20),
    isWholesalePack,
    wholesaleBoriPrice,
    boriWeightKg
  };
  await setDoc(prodDocRef, newProduct);
};

export const updateInventoryItemDoc = async (
  id: string,
  updates: Partial<InventoryItem>
): Promise<void> => {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  // If rate or name or image changed, reflect in POS product
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, id);
  const prodSnap = await getDoc(prodDocRef);
  if (prodSnap.exists()) {
    const currentProd = prodSnap.data() as Product;
    const prodUpdates: Partial<Product> = {};
    if (updates.varietyName) prodUpdates.name = updates.varietyName;
    if (updates.urduName) prodUpdates.urduName = updates.urduName;
    if (updates.packagingStandard) prodUpdates.binLocation = updates.packagingStandard;
    if (updates.category) {
      prodUpdates.category = updates.category;
      prodUpdates.badgeLabel = updates.category.toUpperCase().slice(0, 12);
    }
    if (updates.counterRatePerKg !== undefined) prodUpdates.ratePerKg = updates.counterRatePerKg;
    if (updates.costPerKg !== undefined) prodUpdates.costPerKg = updates.costPerKg;
    if (updates.unitLabel) prodUpdates.unitLabel = updates.unitLabel;
    if (updates.physicalStockKg !== undefined) {
      prodUpdates.availableKg = updates.physicalStockKg;
      const uType = updates.unitType || (currentProd.unitLabel?.includes('pc') ? 'piece' : currentProd.unitLabel?.includes('liter') ? 'liter' : 'kg');
      prodUpdates.availableStockLabel = uType === 'piece'
        ? `${updates.physicalStockKg} Pcs`
        : uType === 'liter'
          ? `${updates.physicalStockKg} L`
          : (updates.physicalStockKg < 1
            ? `${Math.round(updates.physicalStockKg * 1000)}g (${updates.physicalStockKg} kg)`
            : `${updates.physicalStockKg} KG`);
      const threshold = updates.minStockThreshold !== undefined 
        ? updates.minStockThreshold 
        : (currentProd.minStockThreshold ?? 20);
      prodUpdates.minStockThreshold = threshold;
      prodUpdates.isLowStock = updates.physicalStockKg <= threshold;
    }
    if (updates.counterRatePerBag !== undefined) prodUpdates.wholesaleBoriPrice = updates.counterRatePerBag;
    if (updates.unitsPerPack !== undefined) {
      const isLoose = updates.packagingStandard?.includes('Loose') || updates.packagingStandard?.includes('Minor') || updates.packagingStandard === 'loose_minor' || currentProd.binLocation?.includes('Loose');
      prodUpdates.boriWeightKg = isLoose ? 1 : updates.unitsPerPack;
      prodUpdates.isWholesalePack = !isLoose && updates.unitsPerPack > 1;
    }
    if (updates.imageUrl !== undefined) prodUpdates.imageUrl = updates.imageUrl;
    if (updates.tareDeductionKg !== undefined) prodUpdates.tareWeightDefault = updates.tareDeductionKg;

    if (Object.keys(prodUpdates).length > 0) {
      await updateDoc(prodDocRef, prodUpdates);
    }
  }
};

export const deleteInventoryItemDoc = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, INVENTORY_COLLECTION, id));
  // Also remove from products
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (err) {
    console.warn('Failed to delete paired product document:', err);
  }
};

export const addStockInwardDoc = async (
  id: string,
  additionalKg: number,
  additionalBags: number,
  inwardCostPerKg?: number,
  updatedSellingRate?: number
): Promise<void> => {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const current = snap.data() as InventoryItem;
  const newStockKg = current.physicalStockKg + additionalKg;
  const newBagsCount = current.bagsCount + additionalBags;

  let newCost = current.costPerKg;
  if (inwardCostPerKg && inwardCostPerKg > 0) {
    const prevTotalCost = current.physicalStockKg * current.costPerKg;
    const inwardTotalCost = additionalKg * inwardCostPerKg;
    newCost = Math.round(((prevTotalCost + inwardTotalCost) / newStockKg) * 100) / 100;
  }

  const newSellingRate = updatedSellingRate || current.counterRatePerKg;
  const newMargin = newSellingRate - newCost;

  await updateDoc(docRef, {
    physicalStockKg: newStockKg,
    bagsCount: newBagsCount,
    costPerKg: newCost,
    previousCostPerKg: current.costPerKg,
    latestInwardCostPerKg: inwardCostPerKg || current.costPerKg,
    latestInwardDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    counterRatePerKg: newSellingRate,
    marginPerKg: Math.round(newMargin * 100) / 100,
    lotStatus: newStockKg <= 0 ? 'Out of Stock' : newStockKg <= (current.minStockThreshold ?? 20) ? 'Low Stock' : 'In Stock',
    updatedAt: new Date().toISOString()
  });

  // Also sync stock to POS product
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, id);
  try {
    await updateDoc(prodDocRef, {
      availableKg: newStockKg,
      availableStockLabel: `${newStockKg.toLocaleString()} KG`,
      ratePerKg: newSellingRate,
      isLowStock: newStockKg <= (current.minStockThreshold ?? 20)
    });
  } catch (err) {
    console.warn('Product stock sync notice:', err);
  }
};

// =========================================================================
// 2. POS SALES MEMOS & INVENTORY DECREMENTATION
// =========================================================================

export const subscribeToMemos = (callback: (memos: MemoRecord[]) => void) => {
  const colRef = collection(db, MEMOS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const memos: MemoRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MemoRecord, 'id'>)
      }));
      // Sort newest first
      memos.sort((a, b) => (b.id > a.id ? 1 : -1));
      callback(memos);
    },
    (err) => {
      console.error('Error in subscribeToMemos:', err);
    }
  );
};

export const createMemoDoc = async (memo: MemoRecord): Promise<void> => {
  const memoRef = doc(db, MEMOS_COLLECTION, memo.id);
  await setDoc(memoRef, {
    ...memo,
    createdAt: new Date().toISOString()
  });

  // Decrement inventory in Firestore for sold items
  for (const item of memo.items) {
    if (item.product?.id) {
      try {
        const invRef = doc(db, INVENTORY_COLLECTION, item.product.id);
        const invSnap = await getDoc(invRef);
        if (invSnap.exists()) {
          const invData = invSnap.data() as InventoryItem;
          const newQty = Math.max(0, invData.physicalStockKg - item.netWeight);
          const packWeight = invData.unitsPerPack && invData.unitsPerPack > 0 ? invData.unitsPerPack : 25;
          const newBags = Math.floor(newQty / packWeight);

          const threshold = invData.minStockThreshold !== undefined ? invData.minStockThreshold : 20;
          await updateDoc(invRef, {
            physicalStockKg: Math.round(newQty * 100) / 100,
            bagsCount: newBags,
            lotStatus: newQty <= 0 ? 'Out of Stock' : newQty <= (threshold / 2) ? 'Critical Low' : newQty <= threshold ? 'Low Stock' : 'In Stock',
            updatedAt: new Date().toISOString()
          });
        }

        const prodRef = doc(db, PRODUCTS_COLLECTION, item.product.id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const prodData = prodSnap.data() as Product;
          const newAvail = Math.max(0, prodData.availableKg - item.netWeight);
          const threshold = prodData.minStockThreshold !== undefined ? prodData.minStockThreshold : 20;
          await updateDoc(prodRef, {
            availableKg: Math.round(newAvail * 100) / 100,
            availableStockLabel: `${Math.round(newAvail)} KG`,
            isLowStock: newAvail <= threshold
          });
        }
      } catch (err) {
        console.warn(`Failed to decrement stock for item ${item.product.id}:`, err);
      }
    }
  }
};

export const deleteMemoDoc = async (memoId: string, items?: CartItem[]): Promise<void> => {
  // 1. Delete memo document from Firestore
  await deleteDoc(doc(db, MEMOS_COLLECTION, memoId));

  // 2. Restore inventory and product stock for sold items
  if (items && items.length > 0) {
    for (const item of items) {
      if (item.product?.id) {
        try {
          const invRef = doc(db, INVENTORY_COLLECTION, item.product.id);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
            const invData = invSnap.data() as InventoryItem;
            const restoredQty = invData.physicalStockKg + item.netWeight;
            const packWeight = invData.unitsPerPack && invData.unitsPerPack > 0 ? invData.unitsPerPack : 25;
            const newBags = Math.floor(restoredQty / packWeight);

            const threshold = invData.minStockThreshold !== undefined ? invData.minStockThreshold : 20;
            await updateDoc(invRef, {
              physicalStockKg: Math.round(restoredQty * 100) / 100,
              bagsCount: newBags,
              lotStatus: restoredQty <= 0 ? 'Out of Stock' : restoredQty <= (threshold / 2) ? 'Critical Low' : restoredQty <= threshold ? 'Low Stock' : 'In Stock',
              updatedAt: new Date().toISOString()
            });
          }

          const prodRef = doc(db, PRODUCTS_COLLECTION, item.product.id);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
            const prodData = prodSnap.data() as Product;
            const restoredAvail = prodData.availableKg + item.netWeight;
            const threshold = prodData.minStockThreshold !== undefined ? prodData.minStockThreshold : 20;
            await updateDoc(prodRef, {
              availableKg: Math.round(restoredAvail * 100) / 100,
              availableStockLabel: `${Math.round(restoredAvail)} KG`,
              isLowStock: restoredAvail <= threshold
            });
          }
        } catch (err) {
          console.warn(`Failed to restore stock for item ${item.product.id}:`, err);
        }
      }
    }
  }
};

export const updateMemoDoc = async (
  updatedMemo: MemoRecord,
  stockAdjustments?: { productId: string; weightDiff: number }[]
): Promise<void> => {
  const memoRef = doc(db, MEMOS_COLLECTION, updatedMemo.id);
  await setDoc(memoRef, {
    ...updatedMemo,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  if (stockAdjustments && stockAdjustments.length > 0) {
    for (const adj of stockAdjustments) {
      if (!adj.productId || adj.weightDiff === 0) continue;
      try {
        const invRef = doc(db, INVENTORY_COLLECTION, adj.productId);
        const invSnap = await getDoc(invRef);
        if (invSnap.exists()) {
          const invData = invSnap.data() as InventoryItem;
          const newQty = Math.max(0, invData.physicalStockKg - adj.weightDiff);
          const packWeight = invData.unitsPerPack && invData.unitsPerPack > 0 ? invData.unitsPerPack : 25;
          const newBags = Math.floor(newQty / packWeight);
          const threshold = invData.minStockThreshold !== undefined ? invData.minStockThreshold : 20;
          await updateDoc(invRef, {
            physicalStockKg: Math.round(newQty * 100) / 100,
            bagsCount: newBags,
            lotStatus: newQty <= 0 ? 'Out of Stock' : newQty <= (threshold / 2) ? 'Critical Low' : newQty <= threshold ? 'Low Stock' : 'In Stock',
            updatedAt: new Date().toISOString()
          });
        }

        const prodRef = doc(db, PRODUCTS_COLLECTION, adj.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const prodData = prodSnap.data() as Product;
          const newAvail = Math.max(0, prodData.availableKg - adj.weightDiff);
          const threshold = prodData.minStockThreshold !== undefined ? prodData.minStockThreshold : 20;
          await updateDoc(prodRef, {
            availableKg: Math.round(newAvail * 100) / 100,
            availableStockLabel: `${Math.round(newAvail)} KG`,
            isLowStock: newAvail <= threshold
          });
        }
      } catch (err) {
        console.warn(`Failed to adjust stock for item ${adj.productId}:`, err);
      }
    }
  }
};

// =========================================================================
// 3. KHATA CUSTOMERS & TRANSACTIONS
// =========================================================================

export const subscribeToKhataCustomers = (callback: (customers: KhataCustomer[]) => void) => {
  const colRef = collection(db, KHATA_CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const customers: KhataCustomer[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<KhataCustomer, 'id'>)
      }));
      callback(customers);
    },
    (err) => {
      console.error('Error in subscribeToKhataCustomers:', err);
    }
  );
};

export const subscribeToKhataTransactions = (callback: (txs: KhataTransaction[]) => void) => {
  const colRef = collection(db, KHATA_TRANSACTIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const txs: KhataTransaction[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<KhataTransaction, 'id'>)
      }));
      // Sort newest first by timestamp
      txs.sort((a, b) => b.timestamp - a.timestamp);
      callback(txs);
    },
    (err) => {
      console.error('Error in subscribeToKhataTransactions:', err);
    }
  );
};

export const addKhataCustomerDoc = async (customer: KhataCustomer): Promise<void> => {
  const docRef = doc(db, KHATA_CUSTOMERS_COLLECTION, customer.id);
  await setDoc(docRef, {
    ...customer,
    createdAt: customer.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateKhataCustomerDoc = async (
  id: string,
  updates: Partial<KhataCustomer>
): Promise<void> => {
  const docRef = doc(db, KHATA_CUSTOMERS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteKhataCustomerDoc = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, KHATA_CUSTOMERS_COLLECTION, id));
  // Also clean up associated transactions
  try {
    const txCol = collection(db, KHATA_TRANSACTIONS_COLLECTION);
    const snap = await getDocs(txCol);
    for (const d of snap.docs) {
      if (d.data().customerId === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.warn('Error cleaning up customer transactions:', err);
  }
};

export const addKhataTransactionDoc = async (
  tx: KhataTransaction
): Promise<void> => {
  const txRef = doc(db, KHATA_TRANSACTIONS_COLLECTION, tx.id);
  await setDoc(txRef, tx);

  // If this is an OPENING_BALANCE transaction, the customer's totalDebit
  // and currentBalance were already initialized when the customer account was created.
  // We only persist the ledger record and must NOT double-add to totalDebit!
  if (tx.type === 'OPENING_BALANCE') {
    return;
  }

  // Update customer's balance and totals in Firestore
  const custRef = doc(db, KHATA_CUSTOMERS_COLLECTION, tx.customerId);
  const custSnap = await getDoc(custRef);
  if (custSnap.exists()) {
    const cust = custSnap.data() as KhataCustomer;
    const newTotalDebit = cust.totalDebit + (tx.debit || 0);
    const newTotalCredit = cust.totalCredit + (tx.credit || 0);
    const newBalance = newTotalDebit - newTotalCredit;

    await updateDoc(custRef, {
      totalDebit: newTotalDebit,
      totalCredit: newTotalCredit,
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE',
      lastTransactionDate: tx.dateStr,
      updatedAt: new Date().toISOString()
    });
  }
};

export const deleteKhataTransactionDoc = async (
  txId: string,
  customerId: string,
  debit: number,
  credit: number,
  type: string
): Promise<void> => {
  await deleteDoc(doc(db, KHATA_TRANSACTIONS_COLLECTION, txId));

  const custRef = doc(db, KHATA_CUSTOMERS_COLLECTION, customerId);
  const custSnap = await getDoc(custRef);
  if (custSnap.exists()) {
    const cust = custSnap.data() as KhataCustomer;
    const newDebit = (type === 'PURCHASE' || type === 'OPENING_BALANCE') ? Math.max(0, cust.totalDebit - debit) : cust.totalDebit;
    const newCredit = type === 'PAYMENT' ? Math.max(0, cust.totalCredit - credit) : cust.totalCredit;
    const newBalance = Math.max(0, newDebit - newCredit);

    await updateDoc(custRef, {
      totalDebit: newDebit,
      totalCredit: newCredit,
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE',
      updatedAt: new Date().toISOString()
    });
  }
};

// =========================================================================
// 3B. SUPPLIER / MILL KHATA CRUD + REAL-TIME LISTENERS
// =========================================================================

export const subscribeToSuppliers = (callback: (suppliers: Supplier[]) => void) => {
  const colRef = collection(db, SUPPLIERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const suppliers: Supplier[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Supplier, 'id'>)
      }));
      callback(suppliers);
    },
    (err) => {
      console.error('Error in subscribeToSuppliers:', err);
    }
  );
};

export const subscribeToSupplierTransactions = (callback: (txs: SupplierTransaction[]) => void) => {
  const colRef = collection(db, SUPPLIER_TRANSACTIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const txs: SupplierTransaction[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SupplierTransaction, 'id'>)
      }));
      callback(txs);
    },
    (err) => {
      console.error('Error in subscribeToSupplierTransactions:', err);
    }
  );
};

export const addSupplierDoc = async (supplier: Supplier): Promise<void> => {
  const docRef = doc(db, SUPPLIERS_COLLECTION, supplier.id);
  await setDoc(docRef, {
    ...supplier,
    createdAt: supplier.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateSupplierDoc = async (
  id: string,
  updates: Partial<Supplier>
): Promise<void> => {
  const docRef = doc(db, SUPPLIERS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteSupplierDoc = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, SUPPLIERS_COLLECTION, id));
  try {
    const txCol = collection(db, SUPPLIER_TRANSACTIONS_COLLECTION);
    const snap = await getDocs(txCol);
    for (const d of snap.docs) {
      if (d.data().supplierId === id) {
        await deleteDoc(d.ref);
      }
    }
  } catch (err) {
    console.error('Error deleting supplier transactions on cleanup:', err);
  }
};

export const addSupplierTransactionDoc = async (tx: SupplierTransaction): Promise<void> => {
  const docRef = doc(db, SUPPLIER_TRANSACTIONS_COLLECTION, tx.id);
  await setDoc(docRef, {
    ...tx,
    createdAt: new Date().toISOString()
  });

  // If this is an OPENING_BALANCE transaction, the supplier's totalPurchases
  // and currentBalance were already initialized when the supplier account was created.
  // We only persist the ledger record and must NOT double-add to totalPurchases!
  if (tx.type === 'OPENING_BALANCE') {
    return;
  }

  const suppRef = doc(db, SUPPLIERS_COLLECTION, tx.supplierId);
  const suppSnap = await getDoc(suppRef);
  if (suppSnap.exists()) {
    const supp = suppSnap.data() as Supplier;
    const newTotalPurchases = (supp.totalPurchases || 0) + (tx.billAmount || 0);
    const newTotalPaid = (supp.totalPaid || 0) + (tx.paidAmount || 0);
    const newBalance = Math.max(0, newTotalPurchases - newTotalPaid);

    await updateDoc(suppRef, {
      totalPurchases: newTotalPurchases,
      totalPaid: newTotalPaid,
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE',
      lastTransactionDate: tx.dateStr,
      updatedAt: new Date().toISOString()
    });
  }
};

export const deleteSupplierTransactionDoc = async (
  txId: string,
  supplierId: string,
  billAmount: number,
  paidAmount: number,
  type: string
): Promise<void> => {
  await deleteDoc(doc(db, SUPPLIER_TRANSACTIONS_COLLECTION, txId));

  const suppRef = doc(db, SUPPLIERS_COLLECTION, supplierId);
  const suppSnap = await getDoc(suppRef);
  if (suppSnap.exists()) {
    const supp = suppSnap.data() as Supplier;
    const newPurchases = (type === 'PURCHASE' || type === 'OPENING_BALANCE')
      ? Math.max(0, (supp.totalPurchases || 0) - billAmount)
      : (supp.totalPurchases || 0);
    const newPaid = type === 'PAYMENT'
      ? Math.max(0, (supp.totalPaid || 0) - paidAmount)
      : (supp.totalPaid || 0);
    const newBalance = Math.max(0, newPurchases - newPaid);

    await updateDoc(suppRef, {
      totalPurchases: newPurchases,
      totalPaid: newPaid,
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'SETTLED' : 'ACTIVE',
      updatedAt: new Date().toISOString()
    });
  }
};

// =========================================================================
// 4. USERS CRUD & AUTHENTICATION
// =========================================================================

export const subscribeToUsers = (callback: (users: TerminalUser[]) => void) => {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: TerminalUser[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TerminalUser, 'id'>)
      }));
      callback(users);
    },
    (err) => {
      console.error('Error in subscribeToUsers:', err);
    }
  );
};

export const addUserDoc = async (user: TerminalUser): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, user.id);
  await setDoc(docRef, {
    ...user,
    createdAt: new Date().toISOString()
  });
};

export const updateUserDoc = async (
  id: string,
  updates: Partial<TerminalUser>
): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteUserDoc = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COLLECTION, id));
};

export const updateUserPasswordDoc = async (id: string, newPassword: string): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(docRef, {
    password: newPassword,
    updatedAt: new Date().toISOString()
  });
};

// =========================================================================
// 5. CASH DRAWER & DAY-END CLOSING
// =========================================================================

export const subscribeToCashDrawer = (
  callback: (drawer: { openingFloat: number; isDrawerOpen: boolean; drawerOpenedAt: string | null }) => void
) => {
  const docRef = doc(db, CASH_DRAWER_COLLECTION, 'current');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          openingFloat: data.openingFloat || 0,
          isDrawerOpen: data.isDrawerOpen !== undefined ? data.isDrawerOpen : false,
          drawerOpenedAt: data.drawerOpenedAt || null
        });
      } else {
        callback({ openingFloat: 0, isDrawerOpen: false, drawerOpenedAt: null });
      }
    },
    (err) => {
      console.error('Error in subscribeToCashDrawer:', err);
    }
  );
};

export const saveCashDrawerOpeningDoc = async (
  openingFloat: number,
  openedAt: string,
  cashierName?: string,
  notes?: string
): Promise<void> => {
  const docRef = doc(db, CASH_DRAWER_COLLECTION, 'current');
  await setDoc(docRef, {
    openingFloat,
    isDrawerOpen: true,
    drawerOpenedAt: openedAt,
    cashierName: cashierName || 'Cashier',
    notes: notes || '',
    updatedAt: new Date().toISOString()
  });
};

export const closeCashDrawerDoc = async (): Promise<void> => {
  const docRef = doc(db, CASH_DRAWER_COLLECTION, 'current');
  await setDoc(
    docRef,
    {
      isDrawerOpen: false,
      openingFloat: 0,
      drawerOpenedAt: null,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
};

export const saveDayClosingDoc = async (closingData: any): Promise<void> => {
  const closingId = `closing-${Date.now()}`;
  const docRef = doc(db, DAY_CLOSINGS_COLLECTION, closingId);
  await setDoc(docRef, {
    id: closingId,
    ...closingData,
    createdAt: new Date().toISOString()
  });

  // Mark drawer as closed
  await closeCashDrawerDoc();
};

// =========================================================================
// 6. AUTHENTICATION & USER PROFILE SYNC
// =========================================================================

export const getOrCreateUserDoc = async (firebaseUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): Promise<TerminalUser> => {
  const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data() as TerminalUser;
  }

  // Also check if document exists by email
  const colRef = collection(db, USERS_COLLECTION);
  const allUsersSnap = await getDocs(colRef);
  const existing = allUsersSnap.docs.find(
    (d) => d.data().email?.toLowerCase() === firebaseUser.email?.toLowerCase()
  );
  if (existing) {
    return existing.data() as TerminalUser;
  }

  const emailName = (firebaseUser.email || '').split('@')[0] || 'User';
  const role: 'Admin' | 'Cashier' = (firebaseUser.email || '').toLowerCase().includes('admin')
    ? 'Admin'
    : 'Cashier';

  const newUser: TerminalUser = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || emailName,
    urduName: firebaseUser.displayName || emailName,
    email: firebaseUser.email || '',
    role,
    terminal: 'Terminal #01 (Counter 01)',
    status: 'Active'
  };

  await setDoc(userDocRef, {
    ...newUser,
    createdAt: new Date().toISOString()
  });

  return newUser;
};

// Cleanup utility to remove any legacy dummy mock entries from Firestore
export const clearMockDataIfPresent = async (): Promise<void> => {
  const mockInvIds = [
    'sku-bas-01', 'sku-knt-04', 'sku-krk-02', 'sku-sel-03', 'sku-tot-05',
    'sku-pls-01', 'sku-pls-02', 'sku-spc-01', 'sku-spc-02', 'sku-pkg-01',
    'sku-pkg-02', 'sku-oil-01', 'sku-att-01', 'sku-sug-01'
  ];
  for (const id of mockInvIds) {
    try { await deleteDoc(doc(db, INVENTORY_COLLECTION, id)); } catch (_) {}
    try { await deleteDoc(doc(db, PRODUCTS_COLLECTION, id)); } catch (_) {}
  }

  const mockCustIds = [
    'cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5', 'cust-6',
    'khata-cust-01', 'khata-cust-02', 'khata-cust-03', 'khata-cust-04'
  ];
  for (const id of mockCustIds) {
    try { await deleteDoc(doc(db, KHATA_CUSTOMERS_COLLECTION, id)); } catch (_) {}
  }

  const mockTxIds = ['tx-001', 'tx-002', 'tx-003', 'tx-004', 'tx-005', 'tx-006'];
  for (const id of mockTxIds) {
    try { await deleteDoc(doc(db, KHATA_TRANSACTIONS_COLLECTION, id)); } catch (_) {}
  }

  const mockSuppIds = ['supp-001', 'supp-002', 'supp-003', 'supp-004'];
  for (const id of mockSuppIds) {
    try { await deleteDoc(doc(db, SUPPLIERS_COLLECTION, id)); } catch (_) {}
  }

  const mockSuppTxIds = [
    'stx-101', 'stx-102', 'stx-103', 'stx-104',
    'stx-201', 'stx-202',
    'stx-301', 'stx-302',
    'stx-401', 'stx-402'
  ];
  for (const id of mockSuppTxIds) {
    try { await deleteDoc(doc(db, SUPPLIER_TRANSACTIONS_COLLECTION, id)); } catch (_) {}
  }

  // Also query suppliers collection to purge any doc with legacy mock name if created
  try {
    const suppCol = collection(db, SUPPLIERS_COLLECTION);
    const snap = await getDocs(suppCol);
    for (const d of snap.docs) {
      const name = (d.data().name || '').toLowerCase();
      if (
        d.id.startsWith('supp-00') ||
        name.includes('al-rehman') ||
        name.includes('hafizabad modern') ||
        name.includes('madina rice processing') ||
        name.includes('mandi bahauddin basmati hub')
      ) {
        await deleteDoc(d.ref);
      }
    }
  } catch (_) {}

  const mockUserIds = ['usr-1', 'usr-2', 'usr-3', 'usr-4'];
  for (const id of mockUserIds) {
    try { await deleteDoc(doc(db, USERS_COLLECTION, id)); } catch (_) {}
  }

  const mockMemoIds = ['memo-1081', 'memo-1082', 'memo-1083', 'memo-1084', 'memo-1085'];
  for (const id of mockMemoIds) {
    try { await deleteDoc(doc(db, MEMOS_COLLECTION, id)); } catch (_) {}
  }
};
