import React from 'react';
import type { MemoRecord } from '../../types';
import { Printer, AlertCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface MemoLedgerTableProps {
  memos: MemoRecord[];
}

export const MemoLedgerTable: React.FC<MemoLedgerTableProps> = ({ memos }) => {
  const { setActiveReceipt } = usePos();

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden text-xs">
      {/* Policy Reminder Banner */}
      <div className="bg-amber-50/70 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-amber-900 text-[11px]">
        <div className="flex items-center space-x-1.5 font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>STRICT POLICY: NO CREDIT / KHATA (ادھار پر مال دینا سخت منع ہے)</span>
        </div>
        <span className="text-[10px] text-amber-800">
          All counter sales recorded as instant settled transactions.
        </span>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100/80 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">MEMO #</th>
              <th className="py-2.5 px-3">TIME (PKT)</th>
              <th className="py-2.5 px-4">CUSTOMER / BUYER</th>
              <th className="py-2.5 px-4">ITEMS SUMMARY & WEIGHT</th>
              <th className="py-2.5 px-3 text-center">PAYMENT MODE</th>
              <th className="py-2.5 px-4 text-right">NET AMOUNT</th>
              <th className="py-2.5 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {memos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
                  No memos match the selected filters.
                </td>
              </tr>
            ) : (
              memos.map((memo) => (
                <tr key={memo.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Memo No */}
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-emerald-800 text-sm block">
                      {memo.memoNo}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {memo.dateStr.includes('24 Oct') ? 'TODAY' : memo.dateStr}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    <span className="block text-slate-900 font-bold">{memo.dateStr}</span>
                    <span className="text-[10px] text-slate-500">{memo.timeStr}</span>
                  </td>

                  {/* Customer / Buyer */}
                  <td className="py-3 px-4 font-sans">
                    <span className="font-bold text-slate-900 block text-xs">
                      {memo.customerName}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      {memo.customerMeta}
                    </span>
                  </td>

                  {/* Items Summary & Weight */}
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-800 text-[11px] font-mono-num">
                        {memo.weightSummary}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 block truncate max-w-xs">
                      • {memo.itemsSummary}
                    </span>
                  </td>

                  {/* Payment Mode */}
                  <td className="py-3 px-3 text-center">
                    {memo.paymentMode === 'SPOT CASH' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SPOT CASH
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                        RAAST ONLINE
                      </span>
                    )}
                  </td>

                  {/* Net Amount */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-black text-slate-900">
                      PKR {memo.netAmount.toLocaleString()}
                    </span>
                  </td>

                  {/* Action Print Slip */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setActiveReceipt(memo)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                    >
                      <Printer className="w-3 h-3 text-slate-500" />
                      <span>Slip F7</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Exact from Image 1) */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>Showing </span>
          <strong className="text-slate-800 font-mono-num">{memos.length}</strong>
          <span> of </span>
          <strong className="text-slate-800 font-mono-num">84</strong>
          <span> completed spot vouchers • No pending drafts • Zero khata accounts</span>
        </div>

        <div className="flex items-center space-x-1 font-mono-num">
          <button className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50">
            Previous
          </button>
          <button className="px-2 py-0.5 rounded border border-emerald-800 bg-emerald-800 text-white font-bold">
            1
          </button>
          <button className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
            2
          </button>
          <button className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
            3
          </button>
          <button className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
