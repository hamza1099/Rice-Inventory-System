import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { getPakistanDateIso, formatIsoToHuman } from '../../utils/dateUtils';

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
  const { language } = usePos();
  const isUr = language === 'ur';

  const defaultIso = getPakistanDateIso();
  const [tempStart, setTempStart] = useState<string>(startDate || defaultIso);
  const [tempEnd, setTempEnd] = useState<string>(endDate || defaultIso);

  // Parse year & month from startDate or defaultIso
  const [viewYear, setViewYear] = useState<number>(() => {
    const s = startDate || defaultIso;
    const y = parseInt(s.slice(0, 4), 10);
    return isNaN(y) ? 2026 : y;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const s = startDate || defaultIso;
    const m = parseInt(s.slice(5, 7), 10) - 1;
    return isNaN(m) ? 10 : m; // 0-indexed: 10 = November
  });

  const [isRangeSelecting, setIsRangeSelecting] = useState<boolean>(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const activeStart = startDate || defaultIso;
      const activeEnd = endDate || startDate || defaultIso;
      setTempStart(activeStart);
      setTempEnd(activeEnd);

      const y = parseInt(activeStart.slice(0, 4), 10);
      const m = parseInt(activeStart.slice(5, 7), 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m);
      }
      setIsRangeSelecting(false);
    }
  }, [isOpen, startDate, endDate, defaultIso]);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthNamesUr = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Current dynamic month labels for presets
  const todayParts = defaultIso.split('-');
  const currYear = parseInt(todayParts[0], 10);
  const currMonthIdx = parseInt(todayParts[1], 10) - 1;
  const currentMonthLabel = isUr ? monthNamesUr[currMonthIdx] : monthNamesShort[currMonthIdx];
  const prevMonthIdx = (currMonthIdx + 11) % 12;
  const prevMonthLabel = isUr ? monthNamesUr[prevMonthIdx] : monthNamesShort[prevMonthIdx];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate days for viewMonth
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDayClick = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!isRangeSelecting) {
      // First click: select single day
      setTempStart(formatted);
      setTempEnd(formatted);
      setIsRangeSelecting(true);
    } else {
      // Second click: select range
      if (formatted < tempStart) {
        setTempEnd(tempStart);
        setTempStart(formatted);
      } else {
        setTempEnd(formatted);
      }
      setIsRangeSelecting(false);
    }
  };

  const handleStartInputChange = (val: string) => {
    setTempStart(val);
    if (!tempEnd || val > tempEnd) {
      setTempEnd(val);
    }
    const y = parseInt(val.slice(0, 4), 10);
    const m = parseInt(val.slice(5, 7), 10) - 1;
    if (!isNaN(y) && !isNaN(m)) {
      setViewYear(y);
      setViewMonth(m);
    }
  };

  const handleEndInputChange = (val: string) => {
    setTempEnd(val);
    if (val < tempStart) {
      setTempStart(val);
    }
  };

  const isSelected = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (formatted === tempStart && formatted === tempEnd) return 'single';
    if (formatted === tempStart) return 'start';
    if (formatted === tempEnd) return 'end';
    if (tempStart && tempEnd && formatted > tempStart && formatted < tempEnd) {
      return 'in-range';
    }
    return '';
  };

  const isToday = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return formatted === defaultIso;
  };

  const handleApply = () => {
    const finalStart = tempStart || defaultIso;
    const finalEnd = tempEnd || tempStart || defaultIso;
    
    // Sort so start is always <= end
    const safeStart = finalStart <= finalEnd ? finalStart : finalEnd;
    const safeEnd = finalStart <= finalEnd ? finalEnd : finalStart;

    const sStr = formatIsoToHuman(safeStart);
    const eStr = formatIsoToHuman(safeEnd);
    
    const label = safeStart === safeEnd ? sStr : `${sStr} to ${eStr}`;
    onApplyRange(safeStart, safeEnd, label);
    onClose();
  };

  const setPreset = (type: string) => {
    setIsRangeSelecting(false);
    const nowRef = new Date();
    const todayIso = getPakistanDateIso(nowRef);

    if (type === 'today') {
      setTempStart(todayIso);
      setTempEnd(todayIso);
      setViewYear(currYear);
      setViewMonth(currMonthIdx);
    } else if (type === 'yesterday') {
      const yDate = new Date(nowRef.getTime() - 24 * 60 * 60 * 1000);
      const yIso = getPakistanDateIso(yDate);
      setTempStart(yIso);
      setTempEnd(yIso);
      const yParts = yIso.split('-');
      setViewYear(parseInt(yParts[0], 10));
      setViewMonth(parseInt(yParts[1], 10) - 1);
    } else if (type === '7days') {
      const past7 = new Date(nowRef.getTime() - 6 * 24 * 60 * 60 * 1000);
      const sIso = getPakistanDateIso(past7);
      setTempStart(sIso);
      setTempEnd(todayIso);
      setViewYear(currYear);
      setViewMonth(currMonthIdx);
    } else if (type === 'month') {
      const firstIso = `${currYear}-${String(currMonthIdx + 1).padStart(2, '0')}-01`;
      const lastDayNum = new Date(currYear, currMonthIdx + 1, 0).getDate();
      const lastIso = `${currYear}-${String(currMonthIdx + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
      setTempStart(firstIso);
      setTempEnd(lastIso);
      setViewYear(currYear);
      setViewMonth(currMonthIdx);
    } else if (type === 'lastMonth') {
      const prevYear = currMonthIdx === 0 ? currYear - 1 : currYear;
      const firstIso = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-01`;
      const lastDayNum = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
      const lastIso = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
      setTempStart(firstIso);
      setTempEnd(lastIso);
      setViewYear(prevYear);
      setViewMonth(prevMonthIdx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">
                {isUr ? 'تاریخ کا انتخاب کریں' : 'Select Custom Date Range'}
              </h3>
              <p className="text-[11px] text-emerald-100">
                {isUr ? 'روزنامچہ اور کیش فلٹر' : 'Daily sales ledger and cash transaction filter'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5">
          {/* Quick Preset Buttons Inside Modal */}
          <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
              {isUr ? 'شارٹ کٹ:' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() => setPreset('today')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] border cursor-pointer transition-colors ${
                tempStart === defaultIso && tempEnd === defaultIso
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border-slate-200'
              }`}
            >
              {isUr ? 'آج' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('yesterday')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200 cursor-pointer transition-colors"
            >
              {isUr ? 'گزشتہ روز' : 'Yesterday'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('7days')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200 cursor-pointer transition-colors"
            >
              {isUr ? 'پچھلے 7 دن' : 'Last 7 Days'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('month')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200 cursor-pointer transition-colors"
            >
              {isUr ? `موجودہ ماہ (${currentMonthLabel})` : `This Month (${currentMonthLabel})`}
            </button>
            <button
              type="button"
              onClick={() => setPreset('lastMonth')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] border border-slate-200 cursor-pointer transition-colors"
            >
              {isUr ? `پچھلا ماہ (${prevMonthLabel})` : `Last Month (${prevMonthLabel})`}
            </button>
          </div>

          {/* Date Inputs (HTML5 Date Pickers) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-num">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">
                {isUr ? 'تاریخ سے:' : 'From Date:'}
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => handleStartInputChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">
                {isUr ? 'تاریخ تک:' : 'To Date:'}
              </label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => handleEndInputChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Visual Calendar Grid */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 font-mono-num text-sm">
                {isUr ? monthNamesUr[viewMonth] : monthNames[viewMonth]} {viewYear}
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
                <div key={`empty-${idx}`} className="py-1"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const status = isSelected(day);
                const todayClass = isToday(day) ? 'ring-1 ring-emerald-500 font-bold' : '';

                let cellStyle = 'hover:bg-slate-100 text-slate-700';
                if (status === 'single' || status === 'start' || status === 'end') {
                  cellStyle = 'bg-emerald-800 text-white font-bold shadow-xs';
                } else if (status === 'in-range') {
                  cellStyle = 'bg-emerald-100 text-emerald-950 font-semibold';
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`py-1.5 rounded transition-all cursor-pointer ${cellStyle} ${todayClass}`}
                    title={isToday(day) ? (isUr ? 'آج' : 'Today') : undefined}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
          >
            {isUr ? 'منسوخ' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isUr ? 'تاریخ لاگو کریں' : 'Apply Date Range'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
