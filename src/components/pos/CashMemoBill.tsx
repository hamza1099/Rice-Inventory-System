import React, { useState } from 'react';
import { Trash2, Printer, CreditCard, Banknote, User } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifyWarning, notifySuccess } from '../../utils/toast';
import { NumberInput } from '../common/NumberInput';

export const CashMemoBill: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemRate,
    clearCart,
    spotDiscount,
    setSpotDiscount,
    paymentMode,
    setPaymentMode,
    cashReceived,
    setCashReceived,
    completeSale,
    memos,
    isDrawerOpen,
    setIsOpeningModalOpen,
    language
  } = usePos();

  const [customerType, setCustomerType] = useState<string>('Spot Customer');
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');

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
    const sale = completeSale();
    if (sale) {
      notifySuccess(
        language === 'ur'
          ? `کیش میمو ${sale.memoNo} مکمل ہو گیا!`
          : `Cash Memo ${sale.memoNo} completed successfully!`
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between h-full text-xs overflow-hidden">
      {/* Memo Header */}
      <div className="shrink-0 p-2.5 border-b border-slate-200 bg-slate-50/70 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-slate-900 tracking-tight font-mono-num whitespace-nowrap">
            {language === 'ur' ? `کیش میمو ${currentMemoNo}` : `Cash Memo ${currentMemoNo}`}
          </span>
          <button
            onClick={clearCart}
            title={language === 'ur' ? 'تمام لسٹ خالی کریں' : 'Clear all rows'}
            className="text-[10.5px] text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer whitespace-nowrap"
          >
            {language === 'ur' ? 'بل صاف کریں [DEL]' : 'Clear Bill [DEL]'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-num">
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
            <User className="w-2.5 h-2.5 shrink-0" />
            <span>{language === 'ur' ? 'عام گاہک (نقد)' : customerType}</span>
          </span>
          <span className="text-[10.5px] text-slate-500 whitespace-nowrap">{todayDateStr} • {currentTimeStr}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2 px-2.5">{language === 'ur' ? 'تفصیل' : 'Item'}</th>
              <th className="py-2 px-1 text-right">{language === 'ur' ? 'ریٹ' : 'Rate'}</th>
              <th className="py-2 px-1.5 text-right">{language === 'ur' ? 'وزن' : 'Qty'}</th>
              <th className="py-2 px-2 text-right">{language === 'ur' ? 'رقم' : 'Amount'}</th>
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
                          className="w-16 text-right bg-white border-2 border-emerald-600 rounded px-1 py-0.5 text-xs font-bold font-mono-num text-slate-900 focus:outline-hidden shadow-xs"
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
                          <div title={language === 'ur' ? `مقررہ ریٹ: PKR ${item.product.ratePerKg}` : `Base Rate: PKR ${item.product.ratePerKg}`}>
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
                            <span className="opacity-0 group-hover/rate:opacity-100 text-[9px] text-slate-400 font-sans">✎</span>
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-1.5 text-right font-bold text-slate-900 text-[11px]">
                    {item.mode === 'packet'
                      ? `${Math.round(item.netWeight)}`
                      : `${item.netWeight < 1 && item.netWeight > 0 ? parseFloat(item.netWeight.toFixed(3)) : item.netWeight.toFixed(2)} ${language === 'ur' ? 'کلو' : 'kg'}`}
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

        {/* Payment Channels (Spot Cash / Raast) */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            {language === 'ur' ? 'طریقہ ادائیگی:' : 'Payment Channel:'}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setPaymentMode('SPOT CASH')}
              className={`py-1.5 px-2 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                paymentMode === 'SPOT CASH'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'نقد رقم [F8]' : 'Cash [F8]'}</span>
            </button>
            <button
              onClick={() => setPaymentMode('RAAST ONLINE')}
              className={`py-1.5 px-2 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                paymentMode === 'RAAST ONLINE'
                  ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'راست آن لائن [F7]' : 'RAAST [F7]'}</span>
            </button>
          </div>
        </div>

        {/* Cash Tender & Change Due */}
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

        {/* Big Complete Sale CTA */}
        <button
          onClick={handleCheckout}
          className="w-full py-2.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all uppercase tracking-wide cursor-pointer"
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {language === 'ur'
              ? `بل پرنٹ و مکمل کریں [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`
              : `Print Receipt [ENTER] - PKR ${Math.round(totalPayable).toLocaleString()}`}
          </span>
        </button>
      </div>
    </div>
  );
};
