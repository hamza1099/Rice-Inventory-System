import React from 'react';
import { SystemSalesSummary } from '../components/dayEnd/SystemSalesSummary';
import { DenominationCalculator } from '../components/dayEnd/DenominationCalculator';
import { HandoverAuthCard } from '../components/dayEnd/HandoverAuthCard';
import { CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const DayEndClosingScreen: React.FC = () => {
  const { isDayClosed, language } = usePos();
  const isUr = language === 'ur';

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
              TERMINAL 01
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono-num">
            {isUr
              ? '24 Oct 2024 • کیشئر: سید بخاری • شفٹ A • صرف نقد ادائیگی'
              : '24 Oct 2024 • Cashier: S. Bukhari • Shift A • Spot Settlement Only'}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2 font-mono-num">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
              {isUr ? 'آج کی کل سیلز:' : 'GROSS BUSINESS TODAY:'}
            </span>
            <span className="text-xs font-black text-slate-900">PKR 148,250</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded text-right text-emerald-900">
            <span className="text-[9px] uppercase font-bold text-emerald-700 block font-sans flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {isUr ? 'حالت بیلنس:' : 'BALANCE STATUS:'}
            </span>
            <span className="text-xs font-black text-emerald-800">
              {isUr ? '۱۰۰٪ بیلنس' : '100% Balanced'}
            </span>
          </div>
        </div>
      </div>

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
