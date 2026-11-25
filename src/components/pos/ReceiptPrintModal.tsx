import React, { useEffect } from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const ReceiptPrintModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, language, khataCustomers } = usePos();
  
  const isKhata = Boolean(
    activeReceipt && (
      activeReceipt.paymentMode === 'KHATA / CREDIT' ||
      Boolean(activeReceipt.khataCustomerId) ||
      (Boolean(activeReceipt.customerName) &&
        activeReceipt.customerName !== 'Counter Retail Buyer' &&
        !activeReceipt.customerName.toLowerCase().includes('counter'))
    )
  );

  const khataCustomer = activeReceipt?.khataCustomerId
    ? khataCustomers.find((c) => c.id === activeReceipt.khataCustomerId)
    : (activeReceipt?.customerName
      ? khataCustomers.find(
          (c) =>
            c.shopName.toLowerCase() === activeReceipt.customerName.toLowerCase() ||
            activeReceipt.customerName.toLowerCase().includes(c.shopName.toLowerCase()) ||
            (c.customerName && activeReceipt.customerName.toLowerCase().includes(c.customerName.toLowerCase()))
        ) || null
      : null);

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
            className="w-[285px] sm:w-[295px] bg-white px-3.5 py-4 shadow-sm border border-slate-200 text-slate-900 font-mono text-[11px] leading-tight select-text"
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-2.5">
              <h2 className="text-[13px] font-black tracking-wide text-slate-900 mb-1.5">
                BUKHARI RICE TRADERS
              </h2>

              <div className="text-center flex flex-col items-center justify-center w-full my-2.5">
                <p 
                  className="urdu-text text-[17px] text-slate-900 font-bold text-center w-full block pb-1.5 leading-none" 
                  dir="rtl"
                >
                  بخاری رائس ٹریڈرز
                </p>
                <p 
                  className="urdu-text text-[11px] text-slate-700 font-semibold text-center w-full block pt-1.5 leading-normal" 
                  dir="rtl"
                >
                  گلی نمبر 9، لالہ رخ کالونی، چکری روڈ، بنی سٹاپ، راولپنڈی
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-dotted border-slate-300 space-y-1 text-center">
                <p className="text-[9.5px] text-slate-600 font-medium text-center">
                  Lane # 9, Lala Rukh Colony, Chakri Road, Bani Stop, Rawalpindi
                </p>
                <p className="text-[10px] text-slate-800 font-bold font-mono text-center">
                  Phone: 0310-5612914
                </p>
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
                <span>CASHIER:</span>
                <span>{activeReceipt.cashier} • C-01</span>
              </div>

              {/* KHATA CUSTOMER: Only printed for Khata / Credit bills, NEVER for Spot Cash / Raast */}
              {isKhata && (
                <div className="mt-2 pt-2 pb-1 border-t border-b border-dashed border-slate-400 bg-slate-50/80 p-2 rounded text-slate-900 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-[10px] text-purple-900 uppercase">
                      KHATA / کھاتہ:
                    </span>
                    <span className="font-black text-[12px] text-right text-slate-950 max-w-[170px] leading-tight">
                      {khataCustomer?.shopName || activeReceipt.customerName}
                    </span>
                  </div>
                  {khataCustomer?.customerName && khataCustomer.customerName !== khataCustomer.shopName && (
                    <div className="flex justify-between text-[9.5px] text-slate-700">
                      <span>PROPRIETOR / مالک:</span>
                      <span className="font-bold text-slate-900">{khataCustomer.customerName}</span>
                    </div>
                  )}
                  {khataCustomer?.phone && (
                    <div className="flex justify-between text-[9.5px] text-slate-700">
                      <span>PHONE / رابطہ:</span>
                      <span className="font-mono font-bold text-slate-900">{khataCustomer.phone}</span>
                    </div>
                  )}
                  {khataCustomer?.address && (
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>LOCATION / پتہ:</span>
                      <span className="truncate max-w-[170px] text-right">{khataCustomer.address}</span>
                    </div>
                  )}
                </div>
              )}
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
                        {item.netWeight < 0.05 && item.netWeight > 0
                          ? parseFloat(item.netWeight.toFixed(4))
                          : item.netWeight < 1 && item.netWeight > 0
                          ? parseFloat(item.netWeight.toFixed(3))
                          : item.netWeight.toFixed(2)}{' '}
                        kg
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
                <span className={`font-bold ${isKhata ? 'text-purple-900 font-black' : ''}`}>
                  {isKhata
                    ? 'KHATA / CREDIT (ادھار کھاتہ)'
                    : activeReceipt.paymentMode}
                </span>
              </div>
              {isKhata && (
                <div className="bg-purple-50 p-2 rounded border border-purple-200 text-purple-950 text-[10px] font-bold space-y-1 mt-1.5">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-purple-900 font-extrabold">KHATA LEDGER:</span>
                    <span className="font-black text-purple-950 truncate max-w-[150px]">
                      {khataCustomer?.shopName || activeReceipt.customerName}
                    </span>
                  </div>
                  {khataCustomer && (
                    <>
                      <div className="flex justify-between text-[9.5px] text-purple-800">
                        <span>PRIOR BALANCE:</span>
                        <span>PKR {(khataCustomer.currentBalance - activeReceipt.netAmount > 0 ? khataCustomer.currentBalance - activeReceipt.netAmount : 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px] text-purple-800">
                        <span>THIS BILL (+):</span>
                        <span>+ PKR {activeReceipt.netAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-black border-t border-purple-300 pt-0.5 text-purple-950">
                        <span>NEW TOTAL DUE:</span>
                        <span>PKR {khataCustomer.currentBalance.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Signature Line for Khata Receipts */}
            {isKhata && (
              <div className="py-2.5 mb-2 border-b border-dashed border-slate-300 text-[10px]">
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[9.5px] font-bold text-slate-700">وصول کنندہ دستخط / کسٹمر:</span>
                  <span className="text-slate-800 font-mono">____________________</span>
                </div>
              </div>
            )}

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
