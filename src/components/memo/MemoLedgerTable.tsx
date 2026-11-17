import React, { useState } from 'react';
import type { MemoRecord } from '../../types';
import { Printer, Edit3, Trash2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { EditMemoModal } from './EditMemoModal';
import { notifySuccess } from '../../utils/toast';

interface MemoLedgerTableProps {
  memos: MemoRecord[];
  isLoading?: boolean;
}

export const MemoLedgerTable: React.FC<MemoLedgerTableProps> = ({ memos, isLoading = false }) => {
  const { setActiveReceipt, deleteMemo, language } = usePos();
  const isUr = language === 'ur';
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const [memoToEdit, setMemoToEdit] = useState<MemoRecord | null>(null);
  const [memoToDelete, setMemoToDelete] = useState<MemoRecord | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden text-xs">
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
            {isLoading && memos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-500 font-sans">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-xs text-slate-700 font-mono tracking-wide">
                      {isUr ? 'روزنامچہ کیش میمو لوڈ ہو رہے ہیں...' : 'Loading Daily Roznamcha Memos...'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : memos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
                  {isUr ? 'منتخب فلٹر کے مطابق کوئی میمو نہیں ملا' : 'No memos match the selected filters.'}
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
                      {memo.dateStr === todayStr ? 'TODAY' : memo.dateStr}
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

                  {/* Actions: Print Slip, Edit, Delete */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setActiveReceipt(memo)}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                        title={isUr ? 'پرنٹ سلپ (F7)' : 'Print Receipt Slip (F7)'}
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Slip F7</span>
                      </button>

                      <button
                        onClick={() => setMemoToEdit(memo)}
                        className="p-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title={isUr ? 'میمو میں ترمیم کریں' : 'Edit Memo Details'}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => setMemoToDelete(memo)}
                        className="p-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title={isUr ? 'میمو کینسل / حذف کریں' : 'Delete / Void Memo'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>Showing </span>
          <strong className="text-slate-800 font-mono-num">{memos.length}</strong>
          <span> of </span>
          <strong className="text-slate-800 font-mono-num">{Math.max(memos.length, 84)}</strong>
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

      {/* Confirmation Modal for Memo Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(memoToDelete)}
        onClose={() => setMemoToDelete(null)}
        onConfirm={async () => {
          if (memoToDelete) {
            await deleteMemo(memoToDelete.id);
            notifySuccess(
              isUr
                ? `کیش میمو ${memoToDelete.memoNo} حذف کر دیا گیا اور انوینٹری سٹاک بحال ہو گیا۔`
                : `Memo ${memoToDelete.memoNo} deleted and inventory stock restored.`
            );
            setMemoToDelete(null);
          }
        }}
        title={isUr ? `کیش میمو حذف کرنے کی تصدیق (${memoToDelete?.memoNo})` : `Confirm Delete Memo (${memoToDelete?.memoNo})`}
        description={
          isUr
            ? `کیا آپ واقعی میمو ${memoToDelete?.memoNo} کو حذف کرنا چاہتے ہیں؟ اس سے فروخت شدہ سٹاک (${memoToDelete?.weightSummary}) واپس انوینٹری میں بحال ہو جائے گا اور گلے (کیش دراز) سے رقم PKR ${memoToDelete?.netAmount.toLocaleString()} منہا ہو جائے گی۔`
            : `Are you sure you want to delete memo ${memoToDelete?.memoNo}? Sold stock (${memoToDelete?.weightSummary}) will be restored to inventory and cash drawer turnover will be adjusted.`
        }
        itemName={`${memoToDelete?.memoNo} • ${memoToDelete?.itemsSummary}`}
        itemType={isUr ? 'کیش میمو تفصیل:' : 'Memo Details:'}
        confirmText={isUr ? 'ہاں، میمو حذف کریں' : 'Delete Memo'}
        cancelText={isUr ? 'منسوخ' : 'Cancel'}
      />

      {/* Modal for Editing Memo */}
      <EditMemoModal
        memo={memoToEdit}
        isOpen={Boolean(memoToEdit)}
        onClose={() => setMemoToEdit(null)}
      />
    </div>
  );
};
