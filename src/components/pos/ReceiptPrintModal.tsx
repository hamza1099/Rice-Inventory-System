import React, { useEffect } from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const ReceiptPrintModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, language } = usePos();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeReceipt) return;
      if (e.key === 'Escape') {
        setActiveReceipt(null);
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReceipt, setActiveReceipt]);

  if (!activeReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Controls */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ur' ? 'فروخت مکمل • تھرمل پرچی' : 'Sale Completed • Thermal Slip Preview'}
            </span>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div className="p-4 bg-slate-50 flex justify-center">
          <div 
            id="thermal-receipt"
            className="w-[280px] bg-white p-4 shadow-sm border border-slate-200 text-slate-900 font-mono text-[11px] leading-tight select-text"
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-2.5">
              <h2 className="text-sm font-bold tracking-wide">BUKHARI RICE TRADERS</h2>
              <div className="py-1.5">
                <p className="urdu-text text-sm text-slate-800 font-bold !leading-tight" dir="rtl">
                  بخاری رائس ٹریڈرز
                </p>
              </div>
              <div className="pt-0.5 space-y-0.5">
                <p className="text-[9px] text-slate-600">G.T. Road, New Grain Market, Lahore</p>
                <p className="text-[9px] text-slate-600">Phone: 0300-8452199 • NTN: 489210-4</p>
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span>MEMO NO:</span>
                <span className="font-bold">{activeReceipt.memoNo}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{activeReceipt.dateStr} {activeReceipt.timeStr.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-semibold">{activeReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{activeReceipt.cashier} • C-01</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-[10px] mb-2 border-b border-dashed border-slate-300 pb-2">
              <thead>
                <tr className="border-b border-slate-300 text-left font-bold">
                  <th className="py-1">ITEM</th>
                  <th className="py-1 text-right">QTY</th>
                  <th className="py-1 text-right">RATE</th>
                  <th className="py-1 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-slate-200">
                {activeReceipt.items && activeReceipt.items.length > 0 ? (
                  activeReceipt.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">
                        <span className="font-bold block">{item.product.name}</span>
                        <span className="text-[9px] text-slate-500 font-sans">{item.product.urduName}</span>
                      </td>
                      <td className="py-1 text-right font-medium">
                        {item.netWeight < 1 && item.netWeight > 0 ? parseFloat(item.netWeight.toFixed(3)) : item.netWeight.toFixed(2)} kg
                      </td>
                      <td className="py-1 text-right font-medium">{item.ratePerKg}</td>
                      <td className="py-1 text-right font-bold">{Math.round(item.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-1 font-bold">{activeReceipt.itemsSummary}</td>
                    <td className="py-1 text-right">{activeReceipt.weightSummary}</td>
                    <td className="py-1 text-right">-</td>
                    <td className="py-1 text-right font-bold">{activeReceipt.grossAmount}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div className="space-y-1 text-[11px] font-bold border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between text-slate-700">
                <span>GROSS AMOUNT:</span>
                <span>PKR {activeReceipt.grossAmount.toLocaleString()}</span>
              </div>
              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>MANDI ROUNDING:</span>
                  <span>- PKR {activeReceipt.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-900 border-t border-slate-300 pt-1">
                <span>NET PAYABLE:</span>
                <span className="text-sm">PKR {activeReceipt.netAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 font-normal">
                <span>PAYMENT MODE:</span>
                <span className="font-bold">{activeReceipt.paymentMode}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-600 pt-2 space-y-1 border-t border-dashed border-slate-300">
              <div className="py-1">
                <p className="urdu-text font-bold text-slate-800 text-[11px] !leading-normal" dir="rtl">
                  چاول خریدنے کا شکریہ! خریدا ہوا مال واپس اور تبدیل ہر بار ہو جائے گا۔
                </p>
              </div>
              <p className="text-[10px] text-emerald-800 font-bold">Bukhari Rice Traders • 100% کوالٹی و وزن گارنٹی</p>
              <p className="text-[8px] text-slate-400 mt-1">Powered by Bukhari Rice ERP System</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setActiveReceipt(null)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded border border-slate-200 cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں [ESC]' : 'Close [ESC]'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'پرچی پرنٹ کریں [Ctrl+P]' : 'Print Thermal Receipt [Ctrl+P]'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
