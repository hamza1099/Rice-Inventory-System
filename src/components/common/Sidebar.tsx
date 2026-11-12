import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Calculator,
  Receipt,
  Boxes,
  CheckCircle2,
  Users,
  Settings,
  BookOpen
} from 'lucide-react';
import { RouteName } from '../../routes/RouteName';
import { usePos } from '../../context/PosContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { language } = usePos();

  // Keyboard shortcut listener for F1, F2, F3, F4, F8, F9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        navigate(RouteName.POS_COUNTER);
      } else if (e.key === 'F2') {
        e.preventDefault();
        navigate(RouteName.DAILY_MEMO);
      } else if (e.key === 'F3') {
        e.preventDefault();
        navigate(RouteName.STOCK_INVENTORY);
      } else if (e.key === 'F4') {
        e.preventDefault();
        navigate(RouteName.DAY_END);
      } else if (e.key === 'F5') {
        e.preventDefault();
        navigate(RouteName.KHATA);
      } else if (e.key === 'F8') {
        e.preventDefault();
        navigate(RouteName.USER_MANAGEMENT);
      } else if (e.key === 'F9') {
        e.preventDefault();
        navigate(RouteName.SYSTEM_SETTINGS);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const navItems = [
    {
      to: RouteName.POS_COUNTER,
      label: 'POS Counter',
      urdu: 'کاؤنٹر بلنگ',
      key: 'F1',
      icon: Calculator
    },
    {
      to: RouteName.DAILY_MEMO,
      label: 'Daily Memo & Cash',
      urdu: 'روزنامچہ و نقدی',
      key: 'F2',
      icon: Receipt
    },
    {
      to: RouteName.STOCK_INVENTORY,
      label: 'Stock & Inventory',
      urdu: 'گودام و سٹاک',
      key: 'F3',
      icon: Boxes
    },
    {
      to: RouteName.KHATA,
      label: 'Customer Khata',
      urdu: 'ادھار کھاتہ رجسٹر',
      key: 'F5',
      icon: BookOpen
    },
    {
      to: RouteName.DAY_END,
      label: 'Day-End Closing',
      urdu: 'روزانہ اختتام رجسٹر',
      key: 'F4',
      icon: CheckCircle2
    }
  ];

  const adminItems = [
    {
      to: RouteName.USER_MANAGEMENT,
      label: 'User Management',
      urdu: 'صارفین',
      key: 'F8',
      icon: Users
    }
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#064e3b] border-r border-[#033728] flex flex-col justify-between h-full text-xs select-none shadow-sm">
      <div className="p-2 space-y-4">
        {/* Workstation Operations */}
        <div>
          <span className="text-[10px] uppercase font-extrabold text-emerald-300/85 tracking-wider px-2.5 block mb-1.5">
            {language === 'ur' ? 'ورک سٹیشن آپریشنز' : 'Workstation Operations'}
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-md font-bold'
                      : 'text-emerald-100/90 hover:bg-emerald-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-800' : 'text-emerald-300'}`} />
                    <span className={language === 'ur' ? 'font-urdu font-semibold text-[13px]' : 'text-xs'}>
                      {language === 'ur' ? item.urdu : item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Terminal Admin */}
        <div>
          <span className="text-[10px] uppercase font-extrabold text-emerald-300/85 tracking-wider px-2.5 block mb-1.5">
            {language === 'ur' ? 'ٹرمینل ایڈمن' : 'Terminal Admin'}
          </span>
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-md font-bold'
                      : 'text-emerald-100/90 hover:bg-emerald-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-800' : 'text-emerald-300'}`} />
                    <span className={language === 'ur' ? 'font-urdu font-semibold text-[13px]' : 'text-xs'}>
                      {language === 'ur' ? item.urdu : item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Subtle Terminal Watermark Footer */}
      <div className="p-3 border-t border-emerald-800/60 text-[10.5px] text-emerald-200/70 flex items-center justify-between font-mono">
        <span>{language === 'ur' ? 'ٹرمینل #01' : 'TERMINAL #01'}</span>
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-[9.5px] uppercase font-bold text-emerald-300">ONLINE</span>
        </span>
      </div>
    </aside>
  );
};
