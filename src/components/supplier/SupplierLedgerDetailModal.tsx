import React from 'react';
import { X, Printer, Truck, FileText, CheckCircle2, DollarSign, Package } from 'lucide-react';
import type { Supplier, SupplierTransaction } from '../../types';
import { usePos } from '../../context/PosContext';

interface SupplierLedgerDetailModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  transaction: SupplierTransaction | null;
  onClose: () => void;
}

export const SupplierLedgerDetailModal: React.FC<SupplierLedgerDetailModalProps> = ({
  isOpen,
  supplier,
  transaction,
  onClose
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  if (!isOpen || !supplier || !transaction) return null;

  const isPurchase = transaction.type === 'PURCHASE';
  const isPayment = transaction.type === 'PAYMENT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-900/20 text-xs">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${isPurchase ? 'bg-emerald-900' : 'bg-blue-900'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPurchase ? 'bg-emerald-800 text-emerald-200' : 'bg-blue-800 text-blue-200'}`}>
              {isPurchase ? <Package className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isPurchase
                  ? (isUr ? 'آمد مال و خریداری رسید' : 'Stock Inward Chit / Voucher')
                  : (isUr ? 'ادائیگی واؤچر' : 'Payment Voucher')}
              </h2>
              <p className="text-[11px] opacity-80">{transaction.dateStr} • {transaction.timeStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Supplier Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">{isUr ? 'سپلائر / مل:' : 'Mill / Supplier:'}</p>
              <p className="font-bold text-sm text-slate-900">{supplier.name}</p>
              <p className="text-xs text-slate-600">{supplier.city} • {supplier.phone}</p>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isPurchase ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
              }`}>
                {transaction.type}
              </span>
            </div>
          </div>

          {/* Description & Vehicle Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <span className="text-slate-500">{isUr ? 'تفصیل:' : 'Description:'}</span>
              <span className="font-bold text-slate-800 text-right max-w-[260px]">{transaction.description}</span>
            </div>

            {transaction.vehicleNo && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  {isUr ? 'گاڑی نمبر:' : 'Vehicle No:'}
                </span>
                <span className="font-bold text-slate-900">{transaction.vehicleNo}</span>
              </div>
            )}

            {transaction.biltyNo && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isUr ? 'بلٹی نمبر:' : 'Bilty No:'}</span>
                <span className="font-bold text-emerald-900">{transaction.biltyNo}</span>
              </div>
            )}

            {transaction.paymentMode && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isUr ? 'طریقہ ادائیگی:' : 'Payment Mode:'}</span>
                <span className="font-bold text-blue-900 uppercase">{transaction.paymentMode}</span>
              </div>
            )}

            {transaction.referenceNo && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isUr ? 'ریفرنس / چیک نمبر:' : 'Reference No:'}</span>
                <span className="font-bold text-slate-900">{transaction.referenceNo}</span>
              </div>
            )}
          </div>

          {/* Items breakdown if present */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-bold text-slate-700">{isUr ? 'اجناس و مال کی تفصیل:' : 'Items Details:'}</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {transaction.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-800">{it.urduName || it.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {it.bags} {it.unit === 'dozen' ? (isUr ? 'درجن' : 'Dozen') : it.unit === 'pack' ? (isUr ? 'پیکٹ' : 'Pack') : (isUr ? 'بوریاں' : 'Bags')} {it.unit !== 'dozen' && it.weightPerBag ? `x ${it.weightPerBag}kg` : ''} {it.totalKg > 0 ? `(${it.totalKg.toLocaleString()} KG)` : ''} @ Rs. {it.ratePerBag || it.ratePerKg}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">PKR {it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Box */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
            <span className="font-bold text-emerald-900">
              {isPurchase ? (isUr ? 'کل بل رقم:' : 'Total Bill Amount:') : (isUr ? 'ادا شدہ رقم:' : 'Amount Paid:')}
            </span>
            <span className="text-lg font-black text-emerald-950">
              PKR {(isPurchase ? transaction.billAmount : transaction.paidAmount).toLocaleString()}
            </span>
          </div>

          {/* Running Balance After */}
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 font-semibold text-slate-700">
            <span>{isUr ? 'اس ٹرانزیکشن کے بعد بقایا رقم:' : 'Balance After This Transaction:'}</span>
            <span className="font-black text-slate-900">PKR {transaction.balanceAfter.toLocaleString()}</span>
          </div>

          {transaction.notes && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <span className="font-bold mr-1">{isUr ? 'نوٹ:' : 'Note:'}</span>
              {transaction.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isUr ? 'پرنٹ' : 'Print'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold cursor-pointer"
          >
            {isUr ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
