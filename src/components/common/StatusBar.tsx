import React from 'react';

export const StatusBar: React.FC = () => {
  return (
    <footer className="shrink-0 bg-slate-900 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between border-t border-slate-800 sticky bottom-0 z-30 font-mono-num select-none">
      <div className="flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-200 font-semibold">
          Drawer: Active <span className="text-emerald-400">(PKR 45,200 Opening)</span>
        </span>
      </div>
    </footer>
  );
};
