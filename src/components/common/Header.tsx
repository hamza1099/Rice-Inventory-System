import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, LogOut, Wifi, Menu } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { RouteName } from '../../routes/RouteName';
import { notifyInfo } from '../../utils/toast';
import { getPakistanTimeStr } from '../../utils/dateUtils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, language, setLanguage, isMobileSidebarOpen, setIsMobileSidebarOpen } = usePos();
  const isUr = language === 'ur';
  const [timeStr, setTimeStr] = useState<string>(() => getPakistanTimeStr());

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(getPakistanTimeStr());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(RouteName.LOGIN);
    notifyInfo(isUr ? 'ٹرمینل بند ہو گیا۔ کامیابی سے لاگ آؤٹ ہو گیا۔' : 'Terminal locked. Signed out successfully.');
  };

  return (
    <header className="shrink-0 bg-[#043324] border-b border-[#03261a] px-2 sm:px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-30 shadow-md">
      {/* Mobile Menu Button + Brand & Language Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Hamburger Toggle Button (Only on < lg screens) */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden p-1.5 rounded-lg bg-[#032419] text-emerald-300 hover:text-white hover:bg-emerald-800/50 border border-emerald-700/60 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          title={isUr ? 'مینیو کھولیں' : 'Toggle Navigation Menu'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline space-x-1.5 sm:space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 inline-block shrink-0"></span>
          {language === 'ur' ? (
            <h1 className="urdu-text text-base sm:text-xl font-black text-white tracking-wide !leading-none" dir="rtl">
              بخاری رائس ٹریڈرز
            </h1>
          ) : (
            <h1 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
              Bukhari Rice Traders
            </h1>
          )}
        </div>

        {/* Language Toggle Switch */}
        <div className="flex items-center bg-[#032419] p-0.5 rounded-lg border border-emerald-800/80 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="Switch interface to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold font-urdu transition-all cursor-pointer ${
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
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Counter Online Pill (hidden on very small mobile) */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-[#032419] text-emerald-300 border border-emerald-600/40 px-2 py-1 rounded-full text-[10.5px] font-semibold shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="hidden md:inline">{language === 'ur' ? 'آن لائن - کاؤنٹر 01' : 'ONLINE - COUNTER 01'}</span>
          <span className="md:hidden">C-01</span>
        </div>

        {/* Live Clock (hidden on screens < md) */}
        <div className="hidden md:flex items-center space-x-1.5 text-emerald-100 font-mono-num font-medium bg-[#032419] px-2 py-1 rounded border border-emerald-800/80 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{timeStr}</span>
        </div>

        {/* Cashier / User Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#032419] px-2 py-1 rounded border border-emerald-800/80 text-emerald-100">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            <User className="w-3 h-3" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-white block leading-tight text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
              {userProfile
                ? (isUr ? userProfile.urduName || userProfile.name : userProfile.name)
                : currentUser?.displayName || currentUser?.email?.split('@')[0] || (isUr ? 'کیشیئر' : 'Cashier')}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-1 bg-red-950/50 hover:bg-red-900/70 text-red-200 border border-red-800/60 px-2 sm:px-2.5 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer"
          title={isUr ? 'لاگ آؤٹ' : 'Logout'}
        >
          <LogOut className="w-3.5 h-3.5 text-red-300" />
          <span className="hidden sm:inline">{language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};
