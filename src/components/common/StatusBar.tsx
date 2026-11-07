import React from 'react';
import { Printer } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between border-t border-slate-800 sticky bottom-0 z-30 font-mono-num select-none">
      {/* Drawer & Mandi session */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-200 font-semibold">
            Drawer: Active <span className="text-emerald-400">(PKR 45,200 Opening)</span>
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-slate-400">
          <span>Mandi Session: </span>
          <span className="text-amber-300 font-medium">PK-LHR-04 (Morning Lot)</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1 text-slate-400">
          <Printer className="w-3 h-3 text-emerald-400" />
          <span>EPSON TM-T88VI [READY]</span>
        </div>
      </div>

      {/* Quick Keys */}
      <div className="flex items-center space-x-3 text-[10px]">
        <span className="text-slate-500 font-sans uppercase font-bold">Quick Keys:</span>
        <div className="flex items-center space-x-1">
          <kbd className="bg-slate-800 text-amber-300 px-1 rounded border border-slate-700">F12</kbd>
          <span className="text-slate-400">Tender</span>
        </div>
        <div className="flex items-center space-x-1">
          <kbd className="bg-slate-800 text-amber-300 px-1 rounded border border-slate-700">F4</kbd>
          <span className="text-slate-400">Weight Gross</span>
        </div>
        <div className="flex items-center space-x-1">
          <kbd className="bg-slate-800 text-amber-300 px-1 rounded border border-slate-700">DEL</kbd>
          <span className="text-slate-400">Void Row</span>
        </div>
        <div className="flex items-center space-x-1">
          <kbd className="bg-slate-800 text-amber-300 px-1 rounded border border-slate-700">CTRL+P</kbd>
          <span className="text-slate-400">Print Memo</span>
        </div>
      </div>
    </footer>
  );
};
