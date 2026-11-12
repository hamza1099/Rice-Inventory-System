import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, LogOut, Wifi } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { RouteName } from '../../routes/RouteName';
import { notifyInfo } from '../../utils/toast';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { setIsTerminalLocked, language, setLanguage } = usePos();
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

  const handleLogout = () => {
    setIsTerminalLocked(true);
    navigate(RouteName.LOGIN);
    notifyInfo('Terminal locked. Sign in with email to resume access.');
  };

  return (
    <header className="shrink-0 bg-[#043324] border-b border-[#03261a] px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-30 shadow-md">
      {/* Brand & Language Switcher */}
      <div className="flex items-center space-x-4">
        <div className="flex items-baseline space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 inline-block"></span>
          {language === 'ur' ? (
            <h1 className="urdu-text text-xl font-black text-white tracking-wide !leading-none" dir="rtl">
              بخاری رائس ٹریڈرز
            </h1>
          ) : (
            <h1 className="text-base font-extrabold text-white tracking-tight">
              Bukhari Rice Traders
            </h1>
          )}
        </div>

        {/* Language Toggle Switch (At a time only 1 active language) */}
        <div className="flex items-center bg-[#032419] p-0.5 rounded-lg border border-emerald-800/80 shadow-inner">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="Switch interface to English"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-3 py-1 rounded-md text-xs font-bold font-urdu transition-all cursor-pointer ${
              language === 'ur'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="اردو انٹرفیس منتخب کریں"
          >
            اردو
          </button>
        </div>
      </div>

      {/* Status Badges & Cashier Profile */}
      <div className="flex items-center space-x-4">
        {/* Counter Online Pill */}
        <div className="flex items-center space-x-1.5 bg-[#032419] text-emerald-300 border border-emerald-600/40 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>{language === 'ur' ? 'آن لائن - کاؤنٹر 01' : 'ONLINE - COUNTER 01'}</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1.5 text-emerald-100 font-mono-num font-medium bg-[#032419] px-2.5 py-1 rounded border border-emerald-800/80 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{timeStr}</span>
        </div>

        {/* Cashier Badge */}
        <div className="flex items-center space-x-2 bg-[#032419] px-2.5 py-1 rounded border border-emerald-800/80 text-emerald-100">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
            <User className="w-3 h-3" />
          </div>
          <div>
            <span className="font-bold text-white block leading-tight">
              {language === 'ur' ? 'کیشیئر: سید بخاری' : 'Cashier: S. Bukhari'}
            </span>
            <span className="text-[10px] text-emerald-300/80 leading-none">
              {language === 'ur' ? 'شفٹ الف • ٹرمینل #01' : 'Shift A • Terminal #01'}
            </span>
          </div>
        </div>

        {/* Logout Button with Icon */}
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-1.5 bg-red-950/50 hover:bg-red-900/70 text-red-200 border border-red-800/60 px-3 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-300" />
          <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};
