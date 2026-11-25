import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Printer, CreditCard, Banknote, User, BookOpen, UserPlus, Search, X, Store } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifyWarning, notifySuccess } from '../../utils/toast';
import { NumberInput } from '../common/NumberInput';
import { AddCustomerModal } from '../khata/AddCustomerModal';
import type { KhataCustomer } from '../../types';

export const CashMemoBill: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemRate,
    updateCartItemQty,
    clearCart,
    spotDiscount,
    setSpotDiscount,
    paymentMode,
    setPaymentMode,
    selectedKhataCustomerForBill,
    setSelectedKhataCustomerForBill,
    khataCustomers,
    cashReceived,
    setCashReceived,
    completeSale,
    memos,
    isDrawerOpen,
    setIsOpeningModalOpen,
    language
  } = usePos();

  const [isKhataMode, setIsKhataMode] = useState<boolean>(
    () => paymentMode === 'KHATA / CREDIT' || Boolean(selectedKhataCustomerForBill)
  );
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState<boolean>(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState<boolean>(false);

  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync isKhataMode when external state changes
  useEffect(() => {
    if (paymentMode === 'KHATA / CREDIT' || selectedKhataCustomerForBill) {
      setIsKhataMode(true);
    } else {
      setIsKhataMode(false);
      setIsCustomerDropdownOpen(false);
      setCustomerSearchQuery('');
    }
  }, [paymentMode, selectedKhataCustomerForBill]);

  // Click outside to close customer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Shortcuts (F8: Cash, F7: Raast, F9: Khata, Enter: Checkout, Delete: Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMode('SPOT CASH');
        setSelectedKhataCustomerForBill(null);
        setIsKhataMode(false);
        setIsCustomerDropdownOpen(false);
        setCustomerSearchQuery('');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPaymentMode('RAAST ONLINE');
        setSelectedKhataCustomerForBill(null);
        setIsKhataMode(false);
        setIsCustomerDropdownOpen(false);
        setCustomerSearchQuery('');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMode('KHATA / CREDIT');
        setIsKhataMode(true);
        if (!selectedKhataCustomerForBill) {
          setIsCustomerDropdownOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paymentMode, selectedKhataCustomerForBill]);

  const handleStartEditRate = (id: string, currentRate: number) => {
    setEditingRateId(id);
    setTempRate(currentRate.toString());
  };

  const handleSaveRate = (id: string) => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      updateCartItemRate(id, val);
    }
    setEditingRateId(null);
  };

  const now = new Date();
  const todayDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentMemoNo = `#${String(memos.length + 1).padStart(4, '0')}`;

  const grossSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalNetKg = cart.reduce((sum, item) => sum + item.netWeight, 0);
  const totalPayable = Math.max(0, grossSubtotal - spotDiscount);
  const changeDue = Math.max(0, cashReceived - totalPayable);

  // Filter Khata customers by search query
  const filteredCustomers = khataCustomers
    .filter((c) => {
      if (!customerSearchQuery.trim()) return true;
      const q = customerSearchQuery.toLowerCase();
      return (
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.shopName && c.shopName.toLowerCase().includes(q)) ||
        (c.urduName && c.urduName.includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    })
    .slice(0, 8);

  const handleCheckout = () => {
    if (!isDrawerOpen) {
      notifyWarning(
        language === 'ur'
          ? 'پہلے گلہ اوپن کریں! صبح کا کیش درج کریں۔'
          : 'Please open cash drawer first! Enter starting float.'
      );
      setIsOpeningModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      notifyWarning(language === 'ur' ? 'بل خالی ہے! پہلے پروڈکٹس شامل کریں۔' : 'Cart is empty! Add products first.');
      return;
    }

    if (paymentMode === 'KHATA / CREDIT' && !selectedKhataCustomerForBill) {
      notifyWarning(
        language === 'ur'
          ? 'پہلے کھاتہ دار منتخب کریں یا "+ نیا کھاتہ" سے نیا کسٹمر کھولیں!'
          : 'Please select an existing Khata customer or open a new account!'
      );
      setIsKhataMode(true);
      setIsCustomerDropdownOpen(true);
      return;
    }

    const sale = completeSale({ khataCustomer: selectedKhataCustomerForBill });
    if (sale) {
      if (sale.paymentMode === 'KHATA / CREDIT' && selectedKhataCustomerForBill) {
        notifySuccess(
          language === 'ur'
            ? `${selectedKhataCustomerForBill.shopName || selectedKhataCustomerForBill.customerName} کے کھاتے میں بل #${sale.memoNo} درج ہو گیا!`
            : `Bill #${sale.memoNo} recorded to ${selectedKhataCustomerForBill.shopName}'s Khata!`
        );
      } else {
        notifySuccess(
          language === 'ur'
            ? `کیش میمو ${sale.memoNo} مکمل ہو گیا!`
            : `Cash Memo ${sale.memoNo} completed successfully!`
        );
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between h-full text-xs overflow-hidden">
      {/* Memo Header & Customer Selection */}
      <div className="shrink-0 p-2.5 border-b border-slate-200 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900 tracking-tight font-mono-num whitespace-nowrap">
              {paymentMode === 'KHATA / CREDIT'
                ? (language === 'ur' ? `کھاتہ میمو ${currentMemoNo}` : `Khata Memo ${currentMemoNo}`)
                : (language === 'ur' ? `کیش میمو ${currentMemoNo}` : `Cash Memo ${currentMemoNo}`)}
            </span>
            {paymentMode === 'KHATA / CREDIT' && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                {language === 'ur' ? 'ادھار' : 'CREDIT'}
              </span>
            )}
          </div>
          <button
            onClick={clearCart}
            title={language === 'ur' ? 'تمام لسٹ خالی کریں' : 'Clear all rows'}
            className="text-[10.5px] text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer whitespace-nowrap"
          >
            {language === 'ur' ? 'بل صاف کریں [DEL]' : 'Clear Bill [DEL]'}
          </button>
        </div>

        {/* Customer Type Segmented Switch */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-md p-0.5 bg-slate-200/90 border border-slate-300">
              <button
                type="button"
                onClick={() => {
                  setIsKhataMode(false);
                  setSelectedKhataCustomerForBill(null);
                  if (paymentMode === 'KHATA / CREDIT') {
                    setPaymentMode('SPOT CASH');
                  }
                }}
                className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  !isKhataMode
                    ? 'bg-white text-emerald-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-2.5 h-2.5 shrink-0" />
                <span>{language === 'ur' ? 'عام گاہک (نقد)' : 'Spot Cash'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsKhataMode(true);
                  setPaymentMode('KHATA / CREDIT');
                  if (!selectedKhataCustomerForBill) {
                    setIsCustomerDropdownOpen(true);
                  }
                }}
                className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isKhataMode
                    ? 'bg-purple-800 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-2.5 h-2.5 shrink-0" />
                <span>{language === 'ur' ? 'کھاتہ دار (ادھار)' : 'Khata Customer'}</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono-num whitespace-nowrap">
              {todayDateStr} • {currentTimeStr}
            </span>
          </div>

          {/* If Khata Mode is Active: Show Selected Card or Search Input */}
          {isKhataMode && (
            <div className="relative" ref={dropdownRef}>
              {selectedKhataCustomerForBill ? (
                <div className="bg-purple-50 border border-purple-300 rounded-lg p-2 text-purple-950 flex items-start justify-between shadow-2xs animate-in fade-in duration-150">
                  <div className="flex items-start space-x-2 min-w-0">
                    <Store className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-purple-950 truncate">
                          {selectedKhataCustomerForBill.shopName || selectedKhataCustomerForBill.customerName}
                        </span>
                        {selectedKhataCustomerForBill.customerName &&
                          selectedKhataCustomerForBill.shopName !== selectedKhataCustomerForBill.customerName && (
                            <span className="text-[10px] text-purple-700">
                              ({selectedKhataCustomerForBill.customerName})
                            </span>
                          )}
                      </div>
                      <div className="text-[10px] font-mono-num flex items-center space-x-2 mt-0.5 flex-wrap">
                        <span className="text-slate-600">{selectedKhataCustomerForBill.phone || 'No Phone'}</span>
                        <span className="font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300 text-[9.5px]">
                          {language === 'ur' ? 'سابقہ بقایا:' : 'Prior Due:'} PKR{' '}
                          {selectedKhataCustomerForBill.currentBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKhataCustomerForBill(null);
                      setIsCustomerDropdownOpen(true);
                    }}
                    title={language === 'ur' ? 'کھاتہ دار تبدیل کریں' : 'Change Khata Customer'}
                    className="text-slate-400 hover:text-red-600 p-0.5 ml-1 rounded hover:bg-white transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={
                          language === 'ur'
                            ? 'کھاتہ تلاش کریں (دکان، نام یا فون)...'
                            : 'Search customer, shop or phone...'
                        }
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        className="w-full pl-7 pr-2 py-1.5 bg-white border-2 border-purple-400 focus:border-purple-700 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden shadow-2xs"
                      />
                      <Search className="w-3.5 h-3.5 text-purple-600 absolute left-2 top-2 pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="px-2 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-lg font-bold text-[10.5px] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-all"
                      title={language === 'ur' ? 'نیا ادھار کھاتہ کھولیں' : 'Open New Khata Account'}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">{language === 'ur' ? '+ نیا کھاتہ' : '+ New'}</span>
                    </button>
                  </div>

                  {/* Customer Autocomplete Dropdown */}
                  {isCustomerDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-40 max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-center text-slate-400">
                          <p className="text-[11px] font-sans">
                            {language === 'ur' ? 'کوئی کھاتہ دار نہیں ملا' : 'No customer found matching search'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomerDropdownOpen(false);
                              setIsAddCustomerModalOpen(true);
                            }}
                            className="mt-1 text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                          >
                            {language === 'ur' ? '+ نیا کھاتہ کھولیں' : '+ Register new account'}
                          </button>
                        </div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedKhataCustomerForBill(c);
                              setIsCustomerDropdownOpen(false);
                              setCustomerSearchQuery('');
                              setPaymentMode('KHATA / CREDIT');
                            }}
                            className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {c.shopName || c.customerName}
                                {c.shopName && c.customerName && c.shopName !== c.customerName && (
                                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    ({c.customerName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono-num truncate">
                                {c.phone || 'No Phone'} • {c.address || 'Local Market'}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold font-mono-num text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                PKR {c.currentBalance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2 px-2">{language === 'ur' ? 'تفصیل' : 'Item'}</th>
              <th className="py-2 px-1 text-right">{language === 'ur' ? 'ریٹ' : 'Rate'}</th>
              <th className="py-2 px-1 text-center">{language === 'ur' ? 'مقدار / وزن' : 'Qty / Wt'}</th>
              <th className="py-2 px-1.5 text-right">{language === 'ur' ? 'رقم' : 'Amount'}</th>
              <th className="py-2 px-1 text-center w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {cart.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <p className="font-sans text-xs">
                    {language === 'ur' ? 'بل میں کوئی آئٹم شامل نہیں ہے۔' : 'No items added to current memo.'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'ur' ? 'کسی بھی پروڈکٹ پر "وزن کریں" پر کلک کریں۔' : 'Click "Weigh & Add" on any variety.'}
                  </p>
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2.5">
                    {language === 'ur' ? (
                      <span className="urdu-text font-bold text-slate-900 block leading-tight text-[12px]" dir="rtl">
                        {item.product.urduName || item.product.name}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900 block leading-tight font-sans text-xs">
                        {item.product.name}
                      </span>
                    )}
                    {item.tareWeight > 0 && (
                      <span className="text-[9px] text-slate-400 block font-sans">
                        {language === 'ur'
                          ? `کاٹ: -${item.tareWeight.toFixed(2)} کلو`
                          : `Tare: -${item.tareWeight.toFixed(2)} kg`}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-1 text-right text-slate-700 font-medium text-[11px]">
                    {editingRateId === item.id ? (
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          value={tempRate}
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setTempRate(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRate(item.id);
                            if (e.key === 'Escape') setEditingRateId(null);
                          }}
                          onBlur={() => handleSaveRate(item.id)}
                          className="w-16 text-right bg-white border-2 border-emerald-600 rounded px-1 py-0.5 text-xs font-bold font-mono-num text-slate-900 focus:outline-hidden shadow-xs no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditRate(item.id, item.ratePerKg)}
                        className="group/rate text-right cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 transition-colors block w-full"
                        title={language === 'ur' ? 'ریٹ تبدیل کرنے کے لیے کلک کریں' : 'Click to change rate'}
                      >
                        {item.ratePerKg !== item.product.ratePerKg ? (
                          <div
                            title={
                              language === 'ur'
                                ? `مقررہ ریٹ: PKR ${item.product.ratePerKg}`
                                : `Base Rate: PKR ${item.product.ratePerKg}`
                            }
                          >
                            <span className="font-bold text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded border border-amber-300 inline-block font-mono-num">
                              {item.ratePerKg}
                            </span>
                            <span className="text-[9px] text-slate-400 line-through block font-sans">
                              {item.product.ratePerKg}
                            </span>
                          </div>
                        ) : (
                          <span className="group-hover/rate:text-emerald-700 font-medium flex items-center justify-end gap-0.5">
                            {item.ratePerKg}
                            <span className="opacity-0 group-hover/rate:opacity-100 text-[9px] text-slate-400 font-sans">
                              ✎
                            </span>
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {item.mode === 'packet' ? (
                      <div className="inline-flex items-center justify-center gap-1">
                        <div className="h-6 inline-flex items-center justify-center bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty = Math.round(item.netWeight);
                              if (currentQty > 1) {
                                updateCartItemQty(item.id, currentQty - 1);
                              }
                            }}
                            className="w-5 h-full hover:bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs cursor-pointer select-none transition-colors border-r border-slate-200"
                            title={language === 'ur' ? 'ایک کم کریں' : 'Decrease'}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={Math.round(item.netWeight)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0) {
                                updateCartItemQty(item.id, val);
                              }
                            }}
                            className="w-11 h-full text-center font-black font-mono-num bg-transparent px-0.5 py-0.5 text-xs text-slate-900 focus:outline-hidden focus:bg-emerald-50 no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty = Math.round(item.netWeight);
                              updateCartItemQty(item.id, currentQty + 1);
                            }}
                            className="w-5 h-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs cursor-pointer select-none transition-colors border-l border-slate-200"
                            title={language === 'ur' ? 'ایک بڑھائیں' : 'Increase'}
                          >
                            +
                          </button>
                        </div>
                        <span className="w-5 text-left text-[10px] text-slate-500 font-bold font-sans shrink-0">
                          {language === 'ur' ? 'عدد' : 'pc'}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1">
                        <div className="h-6 inline-flex items-center justify-center bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.netWeight > 5 ? 1 : item.netWeight > 1 ? 0.5 : 0.1;
                              const newWt = Math.max(0.01, parseFloat((item.netWeight - step).toFixed(3)));
                              updateCartItemQty(item.id, newWt);
                            }}
                            className="w-5 h-full hover:bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs cursor-pointer select-none transition-colors border-r border-slate-200"
                            title={language === 'ur' ? 'وزن کم کریں' : 'Decrease weight'}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={
                              item.netWeight < 0.05 && item.netWeight > 0
                                ? parseFloat(item.netWeight.toFixed(4))
                                : item.netWeight < 1 && item.netWeight > 0
                                ? parseFloat(item.netWeight.toFixed(3))
                                : parseFloat(item.netWeight.toFixed(2))
                            }
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateCartItemQty(item.id, val);
                              }
                            }}
                            className="w-11 h-full text-center font-black font-mono-num bg-transparent px-0.5 py-0.5 text-xs text-slate-900 focus:outline-hidden focus:bg-emerald-50 no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.netWeight >= 5 ? 1 : item.netWeight >= 1 ? 0.5 : 0.1;
                              const newWt = parseFloat((item.netWeight + step).toFixed(3));
                              updateCartItemQty(item.id, newWt);
                            }}
                            className="w-5 h-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs cursor-pointer select-none transition-colors border-l border-slate-200"
                            title={language === 'ur' ? 'وزن بڑھائیں' : 'Increase weight'}
                          >
                            +
                          </button>
                        </div>
                        <span className="w-5 text-left text-[10px] text-slate-500 font-bold font-sans shrink-0">
                          {language === 'ur' ? 'کلو' : 'kg'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right font-extrabold text-slate-900 text-xs">
                    {Math.round(item.subtotal).toLocaleString()}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                      title={language === 'ur' ? 'حذف کریں' : 'Void row'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Calculation & Tender Box */}
      <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 space-y-2.5">
        {/* Calculations */}
        <div className="space-y-1 font-mono-num text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>
              {language === 'ur'
                ? `کل میزان (${totalNetKg.toFixed(2)} کلو):`
                : `Gross Subtotal (${totalNetKg.toFixed(2)} KG):`}
            </span>
            <span className="font-bold text-slate-800">PKR {Math.round(grossSubtotal).toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-amber-800">
            <span className="flex items-center gap-1 font-sans text-[11px]">
              {language === 'ur' ? 'منڈی کٹوتی / رعایت:' : 'Mandi Spot Rounding / Discount:'}
            </span>
            <div className="flex items-center space-x-1">
              <span>- PKR</span>
              <NumberInput
                value={spotDiscount}
                onChange={setSpotDiscount}
                className="w-16 bg-white border border-amber-300 rounded px-1.5 py-0.5 text-right font-bold text-amber-900 focus:outline-hidden text-xs"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 text-slate-900">
            <span className="font-extrabold uppercase tracking-tight text-xs font-sans">
              {language === 'ur' ? 'کل واجب الادا:' : 'TOTAL PAYABLE:'}
            </span>
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              PKR {Math.round(totalPayable).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Channels (Cash / Raast / Khata) */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            {language === 'ur' ? 'طریقہ ادائیگی:' : 'Payment Channel:'}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setPaymentMode('SPOT CASH');
                setSelectedKhataCustomerForBill(null);
                setIsKhataMode(false);
                setIsCustomerDropdownOpen(false);
                setCustomerSearchQuery('');
              }}
              className={`py-1.5 px-1 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                paymentMode === 'SPOT CASH'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'ur' ? 'نقد' : 'Cash'}</span>
            </button>
            <button
              onClick={() => {
                setPaymentMode('RAAST ONLINE');
                setSelectedKhataCustomerForBill(null);
                setIsKhataMode(false);
                setIsCustomerDropdownOpen(false);
                setCustomerSearchQuery('');
              }}
              className={`py-1.5 px-1 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                paymentMode === 'RAAST ONLINE'
                  ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'ur' ? 'راست' : 'RAAST'}</span>
            </button>
            <button
              onClick={() => {
                setPaymentMode('KHATA / CREDIT');
                setIsKhataMode(true);
                if (!selectedKhataCustomerForBill) {
                  setIsCustomerDropdownOpen(true);
                }
              }}
              className={`py-1.5 px-1 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                paymentMode === 'KHATA / CREDIT'
                  ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'ur' ? 'کھاتہ' : 'Khata'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tender / Financial Box */}
        {paymentMode === 'KHATA / CREDIT' ? (
          <div className="bg-purple-50/90 border border-purple-200 rounded-lg p-2.5 font-mono-num text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans text-[11px]">
                {language === 'ur' ? 'سابقہ پرانا ادھار:' : 'Prior Khata Balance:'}
              </span>
              <span className="font-bold text-slate-800">
                PKR {(selectedKhataCustomerForBill?.currentBalance || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-purple-900">
              <span className="font-sans text-[11px] font-bold">
                {language === 'ur' ? 'موجودہ بل (نیا ادھار):' : 'This Memo Bill:'}
              </span>
              <span className="font-extrabold text-sm text-purple-900">
                + PKR {Math.round(totalPayable).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-purple-200 pt-1 flex items-baseline justify-between">
              <span className="font-sans text-[11px] font-black text-slate-900 uppercase">
                {language === 'ur' ? 'نیا کل کھاتہ بقایا:' : 'New Total Due:'}
              </span>
              <span className="text-base font-black text-rose-700">
                PKR{' '}
                {Math.round(
                  (selectedKhataCustomerForBill?.currentBalance || 0) + totalPayable
                ).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 font-mono-num bg-white p-2 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === 'ur' ? 'نقد وصولی:' : 'Cash Received:'}
              </span>
              <NumberInput
                value={cashReceived}
                onChange={setCashReceived}
                className="w-full text-base font-black px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-hidden focus:border-emerald-600 mt-0.5"
                placeholder="0"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === 'ur' ? 'بقایا رقم:' : 'Change Due:'}
              </span>
              <div className="text-base font-black text-amber-700 mt-1.5">
                PKR {Math.round(changeDue).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Complete Sale CTA */}
        <button
          onClick={handleCheckout}
          className={`w-full py-2.5 px-3 rounded-lg text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all uppercase tracking-wide cursor-pointer active:scale-98 ${
            paymentMode === 'KHATA / CREDIT'
              ? 'bg-purple-800 hover:bg-purple-900'
              : 'bg-emerald-800 hover:bg-emerald-900'
          }`}
        >
          {paymentMode === 'KHATA / CREDIT' ? (
            <BookOpen className="w-4 h-4 shrink-0" />
          ) : (
            <Printer className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">
            {paymentMode === 'KHATA / CREDIT'
              ? language === 'ur'
                ? `کھاتے میں درج کریں و رسید پرنٹ [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`
                : `Record to Khata & Print [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`
              : language === 'ur'
                ? `بل پرنٹ و مکمل کریں [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`
                : `Print Receipt [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`}
          </span>
        </button>
      </div>

      {/* Quick Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCustomerCreated={(newCust: KhataCustomer) => {
          setSelectedKhataCustomerForBill(newCust);
          setIsKhataMode(true);
          setPaymentMode('KHATA / CREDIT');
          setIsCustomerDropdownOpen(false);
          setIsAddCustomerModalOpen(false);
        }}
      />
    </div>
  );
};
