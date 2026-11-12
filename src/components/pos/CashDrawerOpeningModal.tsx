import React, { useState, useEffect } from 'react';
import { Banknote, X, CheckCircle2, Clock, User, ShieldCheck } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const CashDrawerOpeningModal: React.FC = () => {
  const {
    isOpeningModalOpen,
    setIsOpeningModalOpen,
    openingFloat,
    openDrawer,
    isDrawerOpen,
    language
  } = usePos();

  const [amount, setAmount] = useState<string>('15000');
  const [cashierName, setCashierName] = useState<string>('S. Bukhari');
  const [notes, setNotes] = useState<string>('صبح کا ریزگاری فلوٹ (Morning Change Float)');

  const isUr = language === 'ur';

  // Initialize with current openingFloat when opening
  useEffect(() => {
    if (isOpeningModalOpen) {
      setAmount(openingFloat > 0 ? openingFloat.toString() : '15000');
    }
  }, [isOpeningModalOpen, openingFloat]);

  // Handle ESC and ENTER keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpeningModalOpen) return;
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsOpeningModalOpen(false);
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpeningModalOpen, isDrawerOpen, amount, cashierName, notes]);

  if (!isOpeningModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(amount) || 0;
    openDrawer(parsed, cashierName, notes);
  };

  const quickPresets = ['5000', '10000', '15000', '25000', '45200', '50000', '0'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-[#043324] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 border border-emerald-600 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>
                  {isUr
                    ? 'صبح کا گلہ / اوپننگ کیش اندراج'
                    : 'Cash Drawer Opening Balance (گلہ کیش)'}
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                {isUr
                  ? 'بلنگ شروع کرنے سے پہلے گلے میں موجود نقد رقم درج کریں'
                  : 'Enter initial cash in drawer to activate register'}
              </p>
            </div>
          </div>
          {isDrawerOpen && (
            <button
              onClick={() => setIsOpeningModalOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Cashier & Shift Info Strip */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">
                  {isUr ? 'کیشیئر / کاؤنٹر:' : 'Cashier / Counter:'}
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  {cashierName} • Counter #01
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">
                  {isUr ? 'تاریخ و وقت:' : 'Date & Session:'}
                </span>
                <span className="font-bold text-slate-800 text-[11px] font-mono-num">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Main Opening Cash Input */}
          <div>
            <label className="block text-[12px] font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span>
                {isUr
                  ? 'گلے کی ابتدائی نقد رقم (روپے):'
                  : 'Starting Cash Float in Drawer (PKR):'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                {isUr ? 'صبح کا اوپننگ کیش' : 'Opening Ghala Float'}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                value={amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="w-full text-2xl font-black font-mono-num pl-4 pr-16 py-3 bg-white border-2 border-emerald-600 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 text-slate-900 shadow-inner"
              />
              <span className="absolute right-4 top-3.5 font-black text-sm text-emerald-800 uppercase pointer-events-none">
                PKR
              </span>
            </div>
          </div>

          {/* Quick Cash Presets */}
          <div>
            <span className="block text-[11px] text-slate-600 mb-1.5 font-bold">
              {isUr ? 'عام استعمال ہونے والی اوپننگ رقم:' : 'Quick Common Float Presets:'}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {quickPresets.map((val) => {
                const num = parseInt(val);
                const isSelected = amount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-2 rounded-lg border text-xs font-mono-num font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-emerald-50/80 text-slate-800 border-slate-200'
                    }`}
                  >
                    {num === 0 ? (isUr ? '0 (بغیر کیش)' : 'Zero (PKR 0)') : `Rs ${num.toLocaleString()}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isUr ? 'تفصیل / نوٹ (اختیاری):' : 'Notes / Remarks (Optional):'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. صبح کا ریزگاری کیش"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Security & Day-End Closing Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isUr
                ? 'یہ اوپننگ رقم شام کو "Day-End Closing" اور "Daily Memo" میں خود بخود جمع ہو کر کاؤنٹر کی کل سیل کے ساتھ ملائی جائے گی۔'
                : 'This opening float is automatically reconciled in Day-End Closing and Shift Reports against your total daily cash sales.'}
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-mono">
              [ENTER] {isUr ? 'اوپن کریں' : 'Confirm & Open'}
            </span>
            <div className="flex items-center space-x-2">
              {isDrawerOpen && (
                <button
                  type="button"
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  {isUr ? 'منسوخ' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-extrabold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  {isUr
                    ? 'گلہ اوپن کریں اور بلنگ شروع کریں'
                    : 'Open Cash Drawer & Start Billing'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
