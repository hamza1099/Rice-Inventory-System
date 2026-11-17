import React, { useState, useEffect } from 'react';
import { X, Save, ShoppingCart, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { MemoRecord, CartItem } from '../../types';
import { usePos } from '../../context/PosContext';
import { useNavigate } from 'react-router-dom';
import { RouteName } from '../../routes/RouteName';
import { notifySuccess, notifyInfo } from '../../utils/toast';

interface EditMemoModalProps {
  memo: MemoRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemoModal: React.FC<EditMemoModalProps> = ({ memo, isOpen, onClose }) => {
  const { updateMemo, reloadMemoToCart, language } = usePos();
  const navigate = useNavigate();
  const isUr = language === 'ur';

  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'SPOT CASH' | 'RAAST ONLINE'>('SPOT CASH');
  const [discount, setDiscount] = useState<number>(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (memo) {
      setCustomerName(memo.customerName || 'Counter Retail Buyer');
      setPaymentMode(memo.paymentMode || 'SPOT CASH');
      setDiscount(memo.discount || 0);
      setItems(JSON.parse(JSON.stringify(memo.items || [])));
    }
  }, [memo]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !memo) return null;

  const handleWeightChange = (index: number, newWeight: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (!target) return prev;
      const validWeight = Math.max(0.01, newWeight);
      copy[index] = {
        ...target,
        netWeight: validWeight,
        grossWeight: validWeight + (target.tareWeight || 0),
        subtotal: Math.round(validWeight * target.ratePerKg)
      };
      return copy;
    });
  };

  const handleRateChange = (index: number, newRate: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (!target) return prev;
      const validRate = Math.max(0, newRate);
      copy[index] = {
        ...target,
        ratePerKg: validRate,
        subtotal: Math.round(target.netWeight * validRate)
      };
      return copy;
    });
  };

  const grossTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const netTotal = Math.max(0, grossTotal - discount);
  const totalWeight = items.reduce((sum, item) => sum + item.netWeight, 0);

  const handleSave = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const updatedRecord: MemoRecord = {
        ...memo,
        customerName: customerName.trim() || 'Counter Retail Buyer',
        paymentMode,
        discount,
        grossAmount: grossTotal,
        netAmount: netTotal,
        items,
        weightSummary: `${items.length} Items (${totalWeight.toFixed(2)} KG)`,
        itemsSummary: items.map((c) => c.product.name).join(' + ')
      };

      await updateMemo(updatedRecord);
      notifySuccess(
        isUr
          ? `میمو ${memo.memoNo} کامیابی سے تبدیل ہو گیا اور سٹاک ایڈجسٹ ہو گیا۔`
          : `Memo ${memo.memoNo} updated and stock adjusted successfully.`
      );
      onClose();
    } catch (err) {
      console.error('Failed to update memo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReloadToPos = async () => {
    setIsSubmitting(true);
    try {
      await reloadMemoToCart(memo.id);
      notifyInfo(
        isUr
          ? `میمو ${memo.memoNo} کاؤنٹر میں لوڈ کر دیا گیا ہے۔ اب آپ وزن یا ریٹ درست کر کے نئی رسید بنا سکتے ہیں۔`
          : `Memo ${memo.memoNo} loaded into POS Counter. You can adjust items and print a new slip.`
      );
      onClose();
      navigate(RouteName.POS_COUNTER);
    } catch (err) {
      console.error('Failed to reload memo to cart:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                <span>{isUr ? 'کیش میمو میں ترمیم' : 'Edit Cash Memo'}</span>
                <span className="bg-emerald-600/60 text-emerald-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                  {memo.memoNo}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {memo.dateStr} • {memo.timeStr} • {memo.cashier}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Customer Name & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'گاہک / خریدار کا نام:' : 'Customer / Buyer Name:'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'طریقہ ادائیگی:' : 'Payment Mode:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('SPOT CASH')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all border ${
                    paymentMode === 'SPOT CASH'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  SPOT CASH
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('RAAST ONLINE')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all border ${
                    paymentMode === 'RAAST ONLINE'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  RAAST ONLINE
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {isUr ? 'میمو آئٹمز (وزن اور ریٹ تبدیل کریں):' : 'Memo Items (Adjust Weight & Rate):'}
            </label>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              <div className="bg-slate-100/90 text-slate-600 font-bold text-[10px] uppercase grid grid-cols-12 py-2 px-3">
                <span className="col-span-5">{isUr ? 'جنس / ورائٹی' : 'Item / Variety'}</span>
                <span className="col-span-3 text-right">{isUr ? 'خالص وزن (KG)' : 'Net Weight (KG)'}</span>
                <span className="col-span-2 text-right">{isUr ? 'ریٹ' : 'Rate'}</span>
                <span className="col-span-2 text-right">{isUr ? 'رقم' : 'Total'}</span>
              </div>
              {items.map((item, idx) => (
                <div key={item.id || idx} className="grid grid-cols-12 py-2.5 px-3 items-center gap-2 hover:bg-slate-50">
                  <div className="col-span-5">
                    <span className="font-bold text-slate-800 block truncate">{item.product.name}</span>
                    {item.product.urduName && (
                      <span className="text-[10px] text-slate-500 font-urdu block truncate">
                        {item.product.urduName}
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.netWeight}
                      onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-20 text-right font-mono font-bold px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={item.ratePerKg}
                      onChange={(e) => handleRateChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-16 text-right font-mono font-bold px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono font-extrabold text-slate-900">
                    PKR {item.subtotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Totals */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 font-mono">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-sans font-medium">{isUr ? 'مجموعی بل (Gross):' : 'Gross Subtotal:'}</span>
              <span className="font-bold text-slate-900">PKR {grossTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="font-sans font-medium">{isUr ? 'رعایت / ڈسکاؤنٹ (PKR):' : 'Spot Discount (PKR):'}</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-24 text-right font-mono font-bold px-2 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
              <span className="font-sans font-extrabold text-slate-900">
                {isUr ? 'قابل ادا رقم (Net Total):' : 'Net Total Payable:'}
              </span>
              <span className="text-base font-black text-emerald-800">PKR {netTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Notice info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-emerald-900">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isUr
                ? 'وزن یا ریٹ تبدیل کرنے کی صورت میں انوینٹری سٹاک خودکار ایڈجسٹ ہو جائے گا اور گلے کی کیش درست ہو جائے گی۔'
                : 'Adjusting weight or rate will automatically synchronize inventory stock and cash drawer totals.'}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReloadToPos}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition-colors cursor-pointer text-[11px]"
            title={isUr ? 'اس میمو کو کینسل کر کے POS کاؤنٹر میں لوڈ کریں' : 'Reload into live POS Counter to weigh or change items'}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
            <span>{isUr ? 'کاؤنٹر میں لوڈ کریں' : 'Open in POS Counter'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
