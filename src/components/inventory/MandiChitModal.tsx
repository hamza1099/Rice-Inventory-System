import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const MandiChitModal: React.FC = () => {
  const { isMandiChitOpen, setIsMandiChitOpen, inventory } = usePos();

  if (!isMandiChitOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Mandi Inward Stock Receiving Chit</span>
          </div>
          <button onClick={() => setIsMandiChitOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 flex justify-center text-xs">
          <div className="w-[320px] bg-white p-4 border border-slate-300 shadow-xs font-mono text-[11px] space-y-2">
            <div className="text-center border-b border-dashed border-slate-400 pb-2">
              <h3 className="font-extrabold text-xs">BUKHARI RICE TRADERS</h3>
              <p className="urdu-text font-bold text-slate-800" dir="rtl">چٹ آمد مال برائے غلہ منڈی و گودام</p>
              <p className="text-[9px] text-slate-500">Mandi Session: PK-LHR-04 (Morning Lot)</p>
            </div>

            <div className="space-y-1 text-[10px] text-slate-700">
              <div className="flex justify-between">
                <span>INWARD CHIT NO:</span>
                <span className="font-bold">#CHIT-2024-B4</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>24 Oct 2024 • 14:32 PKT</span>
              </div>
              <div className="flex justify-between">
                <span>YARD MUNSHI:</span>
                <span>Munshi Bashir Ahmad</span>
              </div>
              <div className="flex justify-between">
                <span>GODOWN BAY:</span>
                <span>Bay A (Wholesale Lots)</span>
              </div>
            </div>

            <table className="w-full text-[10px] border-t border-b border-slate-300 py-1">
              <thead>
                <tr className="text-left font-bold border-b border-slate-200">
                  <th className="py-1">VARIETY</th>
                  <th className="py-1 text-right">BAGS</th>
                  <th className="py-1 text-right">NET WT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.slice(0, 4).map((item) => (
                  <tr key={item.id}>
                    <td className="py-1 font-bold">{item.varietyName}</td>
                    <td className="py-1 text-right">{item.bagsCount} bori</td>
                    <td className="py-1 text-right font-bold">{item.physicalStockKg}k</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[9px] text-slate-600 space-y-1 pt-1 border-t border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Tare Applied:</span>
                <span>Jute 50kg (-0.95kg/bag)</span>
              </div>
              <div className="flex justify-between">
                <span>Moisture Checked:</span>
                <span className="font-bold text-emerald-800">11.4% (Passed Std)</span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span>Munshi Stamp:</span>
                <span>[VERIFIED & STACKED]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsMandiChitOpen(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded border border-slate-200 cursor-pointer"
          >
            Close [ESC]
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Mandi Chit [Ctrl+P]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
