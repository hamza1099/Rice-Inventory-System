import React from 'react';
import { Download, FileSpreadsheet, Printer, Search, Calendar } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface MemoFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activePeriod: string;
  onPresetClick: (periodId: string) => void;
  selectedPayment: string;
  setSelectedPayment: (m: string) => void;
  dateRangeLabel: string;
  onOpenCalendar: () => void;
  onExportCSV?: () => void;
  onDownloadPDF?: () => void;
}

export const MemoFilterBar: React.FC<MemoFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  activePeriod,
  onPresetClick,
  selectedPayment,
  setSelectedPayment,
  dateRangeLabel,
  onOpenCalendar,
  onExportCSV,
  onDownloadPDF
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const periods = [
    { id: 'today', label: isUr ? 'آج' : 'Today' },
    { id: 'yesterday', label: isUr ? 'گزشتہ روز' : 'Yesterday' },
    { id: '7days', label: isUr ? 'گزشتہ ۷ دن' : 'Last 7 Days' },
    { id: 'month', label: isUr ? 'موجودہ ماہ' : 'This Month' },
    { id: 'custom', label: isUr ? 'تاریخ کا انتخاب' : 'Custom Range' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-3 text-xs">
      {/* Top Header & Export Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center space-x-2">
            {isUr ? (
              <h2 className="urdu-text text-lg font-bold text-slate-900 tracking-wide" dir="rtl">
                روزنامچہ اور یومیہ وصولات
              </h2>
            ) : (
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                Daily Memo Ledger & Archives
              </h2>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {isUr ? 'آڈٹ ریکارڈ' : 'ARCHIVES & AUDIT'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isUr
              ? 'گزشتہ کیش رسیدیں، روزنامچہ اور کیش دراز آڈٹ ریکارڈ'
              : 'Query past spot cash receipts, daily roznamcha records, and audit drawer turnovers'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isUr ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>
          <button 
            onClick={onDownloadPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>{isUr ? 'رپورٹ PDF' : 'Download PDF Report'}</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isUr ? 'روزنامچہ پرنٹ کریں' : 'Print Period Roznamcha [F5]'}</span>
          </button>
        </div>
      </div>

      {/* Date Range Quick Presets */}
      <div className="flex items-center space-x-1 border-t border-slate-100 pt-2.5 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-2 shrink-0">
          QUICK PRESETS:
        </span>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => onPresetClick(p.id)}
            className={`px-3 py-1 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
              activePeriod === p.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters & Search Input */}
      <div className="grid grid-cols-12 gap-3 pt-1 items-center">
        {/* Dynamic Clickable Date Range Box */}
        <div 
          onClick={onOpenCalendar}
          title={isUr ? 'کیلنڈر سے تاریخ منتخب کریں' : 'Click to change date range via calendar'}
          className="col-span-3 flex items-center space-x-2 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-mono-num cursor-pointer group"
        >
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="leading-tight overflow-hidden">
            <span className="text-[9px] uppercase font-bold text-slate-400 block group-hover:text-emerald-700">
              {isUr ? 'منتخب مدت / تاریخ' : 'SELECTED DATE RANGE'}
            </span>
            <span className="text-[11px] font-bold text-slate-900 truncate block">
              {dateRangeLabel}
            </span>
          </div>
        </div>

        <div className="col-span-3">
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-bold text-slate-700 focus:outline-hidden">
            <option>{isUr ? 'کاؤنٹر 01 (سید بخاری)' : 'Counter 01 (S. Bukhari)'}</option>
            <option>{isUr ? 'کاؤنٹر 02 (محمد حمزہ)' : 'Counter 02 (M. Hamza)'}</option>
            <option>{isUr ? 'تمام ٹرمینلز' : 'All Terminal Workstations'}</option>
          </select>
        </div>

        <div className="col-span-3">
          <select 
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">{isUr ? 'تمام ادائیگیاں (نقد و راست)' : 'Payment Mode: All Modes (Spot Only)'}</option>
            <option value="SPOT CASH">{isUr ? 'صرف نقد رقم' : 'Spot Cash Only'}</option>
            <option value="RAAST ONLINE">{isUr ? 'صرف راست / آن لائن' : 'RAAST & Online IBFT Only'}</option>
          </select>
        </div>

        <div className="col-span-3 relative group">
          <input
            type="text"
            placeholder={isUr ? 'میمو نمبر، خریدار یا فون...' : 'Memo #, Buyer, or Phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-500/80 focus:border-emerald-700 focus:bg-white rounded-lg font-semibold text-slate-900 placeholder-emerald-800/70 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 text-xs transition-all"
          />
          <Search className="w-3.5 h-3.5 text-emerald-700 absolute left-2.5 top-2 pointer-events-none group-focus-within:text-emerald-800 group-focus-within:scale-110 transition-all" />
        </div>
      </div>
    </div>
  );
};
