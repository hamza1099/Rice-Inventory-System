import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CalendarRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onApplyRange: (start: string, end: string, label: string) => void;
}

export const CalendarRangeModal: React.FC<CalendarRangeModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApplyRange,
}) => {
  const [tempStart, setTempStart] = useState<string>(startDate || '2024-10-18');
  const [tempEnd, setTempEnd] = useState<string>(endDate || '2024-10-24');
  
  // Current viewing month (year 2024, month 9 = October)
  const [viewYear, setViewYear] = useState<number>(2024);
  const [viewMonth, setViewMonth] = useState<number>(9); // 0-indexed: 9 = October

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate days for viewMonth
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  // Adjust so Monday is 0
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDayClick = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(formatted);
      setTempEnd('');
    } else {
      if (new Date(formatted) < new Date(tempStart)) {
        setTempEnd(tempStart);
        setTempStart(formatted);
      } else {
        setTempEnd(formatted);
      }
    }
  };

  const isSelected = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (formatted === tempStart || formatted === tempEnd) return 'selected';
    if (tempStart && tempEnd && new Date(formatted) > new Date(tempStart) && new Date(formatted) < new Date(tempEnd)) {
      return 'in-range';
    }
    return '';
  };

  const handleApply = () => {
    const finalStart = tempStart || '2024-10-18';
    const finalEnd = tempEnd || tempStart || '2024-10-24';
    
    // Format human label
    const sDate = new Date(finalStart);
    const eDate = new Date(finalEnd);
    const sStr = sDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const eStr = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    
    const label = finalStart === finalEnd ? sStr : `${sStr} to ${eStr}`;
    onApplyRange(finalStart, finalEnd, label);
    onClose();
  };

  const setPreset = (type: string) => {
    if (type === 'today') {
      setTempStart('2024-10-24');
      setTempEnd('2024-10-24');
      setViewYear(2024);
      setViewMonth(9);
    } else if (type === 'yesterday') {
      setTempStart('2024-10-23');
      setTempEnd('2024-10-23');
      setViewYear(2024);
      setViewMonth(9);
    } else if (type === '7days') {
      setTempStart('2024-10-18');
      setTempEnd('2024-10-24');
      setViewYear(2024);
      setViewMonth(9);
    } else if (type === 'month') {
      setTempStart('2024-10-01');
      setTempEnd('2024-10-31');
      setViewYear(2024);
      setViewMonth(9);
    } else if (type === 'lastMonth') {
      setTempStart('2024-09-01');
      setTempEnd('2024-09-30');
      setViewYear(2024);
      setViewMonth(8);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Select Custom Date Range</h3>
              <p className="urdu-text text-[11px] text-emerald-100" dir="rtl">
                تاریخ کا انتخاب کریں (روزنامچہ اور کیش فلٹر)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Quick Preset Buttons Inside Modal */}
          <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => setPreset('today')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200"
            >
              Today (24 Oct)
            </button>
            <button
              type="button"
              onClick={() => setPreset('yesterday')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200"
            >
              Yesterday (23 Oct)
            </button>
            <button
              type="button"
              onClick={() => setPreset('7days')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setPreset('month')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200"
            >
              This Month (Oct)
            </button>
            <button
              type="button"
              onClick={() => setPreset('lastMonth')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200"
            >
              Last Month (Sep)
            </button>
          </div>

          {/* Date Inputs (HTML5 Date Pickers for Direct Keyboard or Native Picker) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono-num">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">
                From Date (تاریخ سے):
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">
                To Date (تاریخ تک):
              </label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Interactive Visual Calendar Grid */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 font-mono-num text-sm">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase mb-1">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono-num text-[11px]">
              {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
                <div key={`empty-${idx}`} className="py-1.5"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const status = isSelected(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`py-1.5 rounded transition-all font-semibold cursor-pointer ${
                      status === 'selected'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : status === 'in-range'
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Date Range (فلٹر لاگو کریں)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
