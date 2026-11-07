import React from 'react';
import { Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const DenominationCalculator: React.FC = () => {
  const { denominations, updateDenominationCount, openingFloat } = usePos();

  const totalCounted = denominations.reduce((sum, d) => sum + d.subtotal, 0);
  const expectedPhysicalCash = openingFloat + 112000; // 127,000
  const variance = totalCounted - expectedPhysicalCash;
  const isBalanced = variance === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Physical Cash Counting
          </h3>
          <span className="urdu-text text-xs text-slate-600 font-semibold" dir="rtl">
            (نوٹوں کی گنتی)
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400">
          TABLE VERIFICATION GRID
        </span>
      </div>

      {/* Denominations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-2 px-3">DENOMINATION (نوٹ)</th>
              <th className="py-2 px-2 text-center">BUNDLE / PACK</th>
              <th className="py-2 px-1 text-center"></th>
              <th className="py-2 px-2 text-center w-24">NOTE COUNT (تعداد)</th>
              <th className="py-2 px-3 text-right">SUBTOTAL (کل رقم)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {denominations.map((row, index) => (
              <tr key={row.label} className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-emerald-800/20 border border-emerald-800 inline-block"></span>
                    <span className="font-bold text-slate-800">{row.label}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center text-slate-500 text-[11px] font-sans">
                  {row.bundle}
                </td>
                <td className="py-2 px-1 text-center text-slate-400 font-bold">
                  {row.multiplier}
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={row.count}
                    onChange={(e) => updateDenominationCount(index, parseInt(e.target.value) || 0)}
                    className="w-20 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded px-1.5 py-1 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-mono-num"
                  />
                </td>
                <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                  PKR {row.subtotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box & Reconciliation Variance */}
      <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3 items-center font-mono-num">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">
            Total Physical Cash Counted:
          </span>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            PKR {totalCounted.toLocaleString()}
          </div>
        </div>

        <div>
          {isBalanced ? (
            <div className="bg-emerald-800 text-white p-2.5 rounded-lg border border-emerald-900 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  RECONCILIATION VARIANCE
                </span>
                <span className="text-sm font-black">PKR 0.00</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-emerald-700 px-2 py-0.5 rounded-full inline-block">
                  100% Balanced
                </span>
                <span className="urdu-text text-[9px] block text-emerald-200 mt-0.5" dir="rtl">
                  (میزان درست ہے)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 text-red-900 p-2.5 rounded-lg border border-red-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-red-700">
                  RECONCILIATION VARIANCE (فرق)
                </span>
                <span className="text-sm font-black text-red-700">
                  {variance > 0 ? `+PKR ${variance.toLocaleString()}` : `-PKR ${Math.abs(variance).toLocaleString()}`}
                </span>
              </div>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
