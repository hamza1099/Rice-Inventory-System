import React, { useState, useEffect } from 'react';
import { Clock, User, Lock, Wifi } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const Header: React.FC = () => {
  const { setIsTerminalLocked } = usePos();
  const [timeStr, setTimeStr] = useState<string>('14:32:00 PKT');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}:${secs} PKT`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-30 shadow-xs">
      {/* Brand & Shortcut */}
      <div className="flex items-center space-x-3">
        <button 
          title="Terminal Quick Switch"
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono px-2 py-1 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
        >
          <span>ALT+R</span>
        </button>
        <div className="flex items-baseline space-x-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            Bukhari Rice Traders
          </h1>
          <span className="urdu-text text-sm text-emerald-800 font-semibold" dir="rtl">
            (بخاری رائس ٹریڈرز)
          </span>
        </div>
      </div>

      {/* Status Badges & Cashier Profile */}
      <div className="flex items-center space-x-4">
        {/* Counter Online Pill */}
        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>ONLINE - COUNTER 01</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1.5 text-slate-600 font-mono-num font-medium bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        {/* Cashier Badge */}
        <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
            <User className="w-3 h-3" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block leading-tight">Cashier: S. Bukhari</span>
            <span className="text-[10px] text-slate-500 leading-none">Shift A • Terminal #01</span>
          </div>
        </div>

        {/* Lock Terminal Button */}
        <button 
          onClick={() => setIsTerminalLocked(true)}
          className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock [ESC]</span>
        </button>
      </div>
    </header>
  );
};
