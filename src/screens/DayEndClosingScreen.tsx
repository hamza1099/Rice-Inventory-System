import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemSalesSummary } from '../components/dayEnd/SystemSalesSummary';
import { DenominationCalculator } from '../components/dayEnd/DenominationCalculator';
import { HandoverAuthCard } from '../components/dayEnd/HandoverAuthCard';
import { CheckCircle2, ShieldCheck, Printer, AlertTriangle, PlayCircle, Banknote } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { RouteName } from '../routes/RouteName';

export const DayEndClosingScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isDayClosed,
    isDrawerOpen,
    sessionMemos,
    sessionDateStr,
    userProfile,
    currentUser,
    denominations,
    openingFloat,
    drawerOpenedAt,
    isPreviousSessionUnclosed,
    setIsOpeningModalOpen,
    startNewDay,
    language
  } = usePos();
  const isUr = language === 'ur';

  // Only calculate for the current day / active shift's memos
  const totalGrossBusiness = sessionMemos.reduce((sum, m) => sum + m.netAmount, 0);
  const spotCashCollected = sessionMemos
    .filter((m) => m.paymentMode === 'SPOT CASH')
    .reduce((sum, m) => sum + m.netAmount, 0);
  const expectedPhysicalCash = openingFloat + spotCashCollected;
  const totalCounted = denominations.reduce((sum, d) => sum + d.subtotal, 0);
  const variance = totalCounted - expectedPhysicalCash;
  const isBalanced = variance === 0;

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
              ? `${sessionDateStr} • کیشیئر: ${cashierName} • شفٹ A • یومیہ کیش و سیلز کلوزنگ`
              : `${sessionDateStr} • Cashier: ${cashierName} • Shift A • Daily Register Settlement`}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono-num">
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
                : (isUr ? `فرق: ${variance > 0 ? '+' : ''}${variance.toLocaleString()}` : `Diff: ${variance > 0 ? '+' : ''}${variance.toLocaleString()}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Closed Day Confirmation Banner */}
      {isDayClosed && (
        <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-3.5 flex items-center justify-between text-xs text-emerald-950 flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-extrabold text-emerald-900 text-sm">
                {isUr
                  ? `آج (${sessionDateStr}) کا سیشن کامیابی سے مہر بند (Sealed) ہو چکا ہے`
                  : `Day-End Register Closed & Sealed for ${sessionDateStr}`}
              </p>
              <p className="text-[11px] text-emerald-700">
                {isUr
                  ? 'Z-Report فائنل ہو چکی ہے اور کیش دراز لاک ہے۔ نیا سیشن شروع کرنے کے لیے "نیا دن شروع کریں" بٹن دبائیں۔'
                  : 'Z-Report has been generated and cash drawer is locked. Click "Start Fresh Day" to open the next session.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              startNewDay();
              navigate(RouteName.POS_COUNTER);
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <PlayCircle className="w-4 h-4 text-emerald-200" />
            <span>{isUr ? 'نیا دن شروع کریں' : 'Start Fresh Day'}</span>
          </button>
        </div>
      )}

      {/* Drawer Not Opened Notice */}
      {!isDrawerOpen && !isDayClosed && !isPreviousSessionUnclosed && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center justify-between text-xs text-amber-950 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">
                {isUr
                  ? 'کاؤنٹر گلہ ابھی اوپن نہیں ہوا ہے'
                  : 'Cash Drawer has not been opened yet for today'}
              </p>
              <p className="text-[11px] text-amber-800">
                {isUr
                  ? 'صبح کا اوپننگ کیش درج کر کے گلہ اوپن کریں تاکہ یومیہ سیلز اور کیش ریکارڈ ٹریک ہو سکے۔'
                  : 'Please enter starting opening cash float to begin tracking today\'s sales and cash reconciliation.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpeningModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
          >
            {isUr ? 'گلہ اوپن کریں' : 'Open Drawer'}
          </button>
        </div>
      )}

      {/* Previous Session Unclosed Warning Alert */}
      {isPreviousSessionUnclosed && sessionMemos.length > 0 && (
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: System Expected Cash */}
        <div className="col-span-1 lg:col-span-5">
          <SystemSalesSummary />
        </div>

        {/* Right Column: Physical Cash Counting */}
        <div className="col-span-1 lg:col-span-7">
          <DenominationCalculator />
        </div>
      </div>

      {/* Bottom Closing Authorization & Protocol Card */}
      <HandoverAuthCard />
    </div>
  );
};
