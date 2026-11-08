import React from 'react';
import { Download, FileSpreadsheet, Printer, Search, Calendar } from 'lucide-react';

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
  const periods = [
    { id: 'today', label: 'Today (آج)' },
    { id: 'yesterday', label: 'Yesterday (گزشتہ روز)' },
    { id: '7days', label: 'Last 7 Days (گزشتہ ۷ دن)' },
    { id: 'month', label: 'This Month (موجودہ ماہ)' },
    { id: 'custom', label: 'Custom Range (تاریخ کا انتخاب)' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-3 text-xs">
      {/* Top Header & Export Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Daily Memo Ledger & Archives
            </h2>
            <span className="urdu-text text-sm text-emerald-800 font-bold" dir="rtl">
              (روزنامچہ اور یومیہ وصولات)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              ARCHIVES & AUDIT
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Query past spot cash receipts, daily roznamcha records, and audit drawer turnovers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={onDownloadPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Download PDF Report</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Period Roznamcha [F5]</span>
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
          title="Click to change date range via calendar"
          className="col-span-3 flex items-center space-x-2 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-mono-num cursor-pointer group"
        >
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="leading-tight overflow-hidden">
            <span className="text-[9px] uppercase font-bold text-slate-400 block group-hover:text-emerald-700">
              SELECTED DATE RANGE
            </span>
            <span className="text-[11px] font-bold text-slate-900 truncate block">
              {dateRangeLabel}
            </span>
          </div>
        </div>

        <div className="col-span-3">
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-bold text-slate-700 focus:outline-hidden">
            <option>Cashier & Terminal: Counter 01 (S. Bukhari)</option>
            <option>Counter 02 (M. Hamza)</option>
            <option>All Terminal Workstations</option>
          </select>
        </div>

        <div className="col-span-3">
          <select 
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Payment Mode: All Modes (Spot Only)</option>
            <option value="SPOT CASH">Spot Cash Only</option>
            <option value="RAAST ONLINE">RAAST & Online IBFT Only</option>
          </select>
        </div>

        <div className="col-span-3 relative">
          <input
            type="text"
            placeholder="Memo #, Buyer, or Phone... [F3]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>
    </div>
  );
};
