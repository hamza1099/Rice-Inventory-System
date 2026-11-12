import React from 'react';
import { usePos } from '../../context/PosContext';

export const StatusBar: React.FC = () => {
  const { isDrawerOpen, openingFloat, setIsOpeningModalOpen, language } = usePos();
  const isUr = language === 'ur';

  return (
    <footer className="shrink-0 bg-slate-900 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between border-t border-slate-800 sticky bottom-0 z-30 font-mono-num select-none">
      <div className="flex items-center space-x-2">
        {isDrawerOpen ? (
          <button
            onClick={() => setIsOpeningModalOpen(true)}
            className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer group"
            title={isUr ? 'اوپننگ کیش دیکھنے یا تبدیل کرنے کے لیے کلک کریں' : 'Click to view or edit Opening Cash Float'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-semibold group-hover:underline">
              {isUr ? 'گلہ:' : 'Drawer:'}{' '}
              <span className="text-emerald-300">
                {isUr ? 'فعال' : 'Active'}
              </span>{' '}
              <span className="text-emerald-400 font-bold">
                (PKR {openingFloat.toLocaleString()} {isUr ? 'اوپننگ' : 'Opening'})
              </span>
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 ml-1">
              [{isUr ? 'تبدیل کریں' : 'Edit'}]
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpeningModalOpen(true)}
            className="flex items-center space-x-1.5 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            title={isUr ? 'صبح کا کیش درج کریں' : 'Click to enter opening cash float'}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-bold underline">
              {isUr
                ? 'گلہ بند ہے • صبح کا اوپننگ کیش درج کرنے کے لیے یہاں کلک کریں'
                : 'Drawer: Not Opened • Click to Enter Opening Cash'}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3 text-slate-400 text-[10px]">
        <span>Terminal #01 • Cashier: S. Bukhari</span>
        <span className="text-emerald-400">● ONLINE</span>
      </div>
    </footer>
  );
};
