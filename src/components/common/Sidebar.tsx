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

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

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
      label: 'Customer Khata (ادھار)',
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
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-full text-xs select-none">
      <div className="p-2 space-y-4">
        {/* Workstation Operations */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider px-2 block mb-1.5">
            Workstation Operations
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-2 rounded font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-2">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.key}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Terminal Admin */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider px-2 block mb-1.5">
            Terminal Admin
          </span>
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-2 rounded font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-2">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.key}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};
