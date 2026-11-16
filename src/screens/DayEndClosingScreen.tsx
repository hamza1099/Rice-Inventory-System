import React from 'react';
import { SystemSalesSummary } from '../components/dayEnd/SystemSalesSummary';
import { DenominationCalculator } from '../components/dayEnd/DenominationCalculator';
import { HandoverAuthCard } from '../components/dayEnd/HandoverAuthCard';
import { CheckCircle2, ShieldCheck, Printer, AlertTriangle } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const DayEndClosingScreen: React.FC = () => {
  const {
    isDayClosed,
    memos,
    userProfile,
    currentUser,
    denominations,
    openingFloat,
    drawerOpenedAt,
    isPreviousSessionUnclosed,
    language
  } = usePos();
  const isUr = language === 'ur';

  const totalGrossBusiness = memos.reduce((sum, m) => sum + m.netAmount, 0);
  const spotCashCollected = memos
    .filter((m) => m.paymentMode === 'SPOT CASH')
    .reduce((sum, m) => sum + m.netAmount, 0);
  const expectedPhysicalCash = openingFloat + spotCashCollected;
  const totalCounted = denominations.reduce((sum, d) => sum + d.subtotal, 0);
  const variance = totalCounted - expectedPhysicalCash;
  const isBalanced = variance === 0;

  const now = new Date();
  const todayDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  let sessionDateStr = todayDateStr;
  if (isPreviousSessionUnclosed && drawerOpenedAt) {
    try {
      sessionDateStr = new Date(drawerOpenedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) {}
  }
  const cashierName = userProfile
    ? (isUr ? userProfile.urduName || userProfile.name : userProfile.name)
    : (currentUser?.displayName || currentUser?.email?.split('@')[0] || (isUr ? 'کیشیئر' : 'Cashier'));
  const terminalName = userProfile?.terminal || 'TERMINAL 01';

  return (
    <div className="space-y-3">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between text-xs flex-wrap gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              {isUr
                ? 'روزانہ اختتام اور کیش کلوزنگ رجسٹر'
                : 'Day-End Register Closing & Z-Report Generation'}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
              {terminalName.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono-num">
            {isUr
              ? `${sessionDateStr} • کیشیئر: ${cashierName} • شفٹ A • صرف نقد ادائیگی`
              : `${sessionDateStr} • Cashier: ${cashierName} • Shift A • Spot Settlement Only`}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2 font-mono-num">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
              {isUr ? 'آج کی کل سیلز:' : 'GROSS BUSINESS TODAY:'}
            </span>
            <span className="text-xs font-black text-slate-900">
              PKR {totalGrossBusiness.toLocaleString()}
            </span>
          </div>

          <div className={`px-3 py-1 rounded text-right border ${
            isBalanced
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <span className="text-[9px] uppercase font-bold block font-sans flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {isUr ? 'حالت بیلنس:' : 'BALANCE STATUS:'}
            </span>
            <span className={`text-xs font-black ${isBalanced ? 'text-emerald-800' : 'text-red-700'}`}>
              {isBalanced
                ? (isUr ? '۱۰۰٪ بیلنس' : '100% Balanced')
                : (isUr ? `فرق: ${variance > 0 ? '+' : ''}${variance}` : `Diff: ${variance > 0 ? '+' : ''}${variance}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Previous Session Unclosed Warning Alert */}
      {isPreviousSessionUnclosed && memos.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center justify-between text-xs text-amber-950 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">
                {isUr
                  ? `سابقہ سیشن (${sessionDateStr}) کا غیر مہر بند ریکارڈ کلوز کیا جا رہا ہے`
                  : `Closing Unclosed Shift from ${sessionDateStr}`}
              </p>
              <p className="text-[11px] text-amber-800">
                {isUr
                  ? 'برائے مہربانی ایڈمن پاس ورڈ کے ساتھ اس سیشن کو سیل کریں۔ اس کے بعد آج کے نئے دن کا اوپننگ گلہ درج کیا جائے گا۔'
                  : 'Please enter admin password and seal this register to start today with a fresh cash float.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid: System Sales & Physical Denomination Calculator */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column: System Expected Cash */}
        <div className="col-span-5">
          <SystemSalesSummary />
        </div>

        {/* Right Column: Physical Cash Counting */}
        <div className="col-span-7">
          <DenominationCalculator />
        </div>
      </div>

      {/* Bottom Closing Authorization & Protocol Card */}
      <HandoverAuthCard />
    </div>
  );
};
