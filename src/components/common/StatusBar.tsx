import React from 'react';
import { usePos } from '../../context/PosContext';

export const StatusBar: React.FC = () => {
  const { isDrawerOpen, openingFloat, setIsOpeningModalOpen, userProfile, language } = usePos();
  const isUr = language === 'ur';

  const cashierName = userProfile
    ? (isUr ? userProfile.urduName || userProfile.name : userProfile.name)
    : (isUr ? 'ایڈمن' : 'Admin');
  const terminalName = userProfile?.terminal || 'Terminal #01';

  return (
    <footer className="shrink-0 bg-slate-900 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between border-t border-slate-800 sticky bottom-0 z-30 font-mono-num select-none">
      <div className="flex items-center space-x-2">
        {isDrawerOpen ? (
          <div
            className="flex items-center space-x-1.5"
            title={isUr ? 'آج کا سیشن فعال ہے' : 'Session is active'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-semibold">
              {isUr ? 'گلہ:' : 'Drawer:'}{' '}
              <span className="text-emerald-300">
                {isUr ? 'فعال' : 'Active'}
              </span>{' '}
              <span className="text-emerald-400 font-bold">
                (PKR {openingFloat.toLocaleString()} {isUr ? 'اوپننگ' : 'Opening'})
              </span>
            </span>
          </div>
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
        <span>{terminalName} • {isUr ? 'کیشیئر:' : 'Cashier:'} {cashierName}</span>
        <span className="text-emerald-400">● ONLINE</span>
      </div>
    </footer>
  );
};
