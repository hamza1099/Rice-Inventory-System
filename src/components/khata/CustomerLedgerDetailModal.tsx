import React from 'react';
import type { KhataCustomer, KhataTransaction } from '../../types';
import { usePos } from '../../context/PosContext';
import {
  X,
  Phone,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Printer,
  Edit,
  Trash2,
  Clock,
  Send
} from 'lucide-react';

interface CustomerLedgerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: KhataCustomer | null;
  transactions: KhataTransaction[];
  onOpenAddPurchase: () => void;
  onOpenReceivePayment: () => void;
  onOpenStatementPrint: () => void;
  onOpenEditCustomer: () => void;
  onDeleteTransaction: (txId: string, desc: string) => void;
  onSendWhatsApp: (customer: KhataCustomer) => void;
}

export const CustomerLedgerDetailModal: React.FC<CustomerLedgerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  transactions,
  onOpenAddPurchase,
  onOpenReceivePayment,
  onOpenStatementPrint,
  onOpenEditCustomer,
  onDeleteTransaction,
  onSendWhatsApp,
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-hidden animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-xs animate-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Selected Customer Header Banner */}
        <div className="shrink-0 p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Customer Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded text-[11px] font-bold uppercase">
                  Khata #{customer.id}
                </span>
                <h2 className="text-xl font-black tracking-tight">
                  {isUr ? (customer.urduName || customer.shopName) : customer.shopName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>
                  {isUr ? 'مالک / پروپرائیٹر:' : 'Proprietor:'}{' '}
                  <strong className="text-white">{customer.customerName}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {customer.phone}
                </span>
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {customer.address}
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Balance Card + Close Button */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 flex items-center gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                    {isUr ? 'موجودہ واجب الادا بقایا رقم' : 'Current Outstanding Balance'}
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono-num">
                      PKR {customer.currentBalance.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        customer.currentBalance > 0
                          ? 'bg-rose-500/80 text-white'
                          : 'bg-emerald-500/80 text-white'
                      }`}
                    >
                      {customer.currentBalance > 0
                        ? (isUr ? 'واجب الادا' : 'Pending')
                        : (isUr ? 'مکمل بیباق' : 'Settled')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer self-start"
                title={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Add Udhar Purchase Button */}
              <button
                onClick={onOpenAddPurchase}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4 text-slate-950" />
                <span>{isUr ? '+ ادھار مال دیں' : '+ Udhar Purchase'}</span>
              </button>

              {/* Receive Payment Button */}
              <button
                onClick={onOpenReceivePayment}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 text-white" />
                <span>{isUr ? '+ رقم وصول کریں' : '+ Receive Payment'}</span>
              </button>

              {/* WhatsApp Reminder Button */}
              <button
                onClick={() => onSendWhatsApp(customer)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white font-semibold rounded-xl text-xs border border-emerald-500/40 transition-all cursor-pointer"
                title={isUr ? 'گاہک کو واٹس ایپ پر بقایا کا میسج بھیجیں' : 'Send WhatsApp Reminder'}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isUr ? 'واٹس ایپ یاد دہانی' : 'WhatsApp Reminder'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Print Statement Button */}
              <button
                onClick={onOpenStatementPrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isUr ? 'کھاتہ پرنٹ' : 'Print Statement'}</span>
              </button>

              {/* Edit Customer Button */}
              <button
                onClick={onOpenEditCustomer}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
                title={isUr ? 'گاہک کی معلومات تبدیل کریں' : 'Edit Customer Details'}
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {isUr ? 'روزنامچہ کھاتہ نقل' : 'Date-wise Itemized Ledger'}
              </h3>
              <p className="text-xs text-slate-500">
                {isUr
                  ? 'تمام خریداریاں، اجناس ڈسپیچ اور موصول شدہ رقوم کی تاریخ وار تفصیل'
                  : 'Chronological history of purchases, grain dispatches, and payments'}
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {isUr ? 'کل ٹرانزیکشنز:' : 'Total Transactions:'}{' '}
              <span className="text-slate-800 font-bold">{transactions.length}</span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 w-32">{isUr ? 'تاریخ و وقت' : 'Date & Time'}</th>
                  <th className="py-3 px-3 w-28">{isUr ? 'نوعیت' : 'Type'}</th>
                  <th className="py-3 px-3">{isUr ? 'تفصیل و اجناس' : 'Description & Items'}</th>
                  <th className="py-3 px-3 text-right w-28">{isUr ? 'بنام (+)' : 'Debit (+)'}</th>
                  <th className="py-3 px-3 text-right w-28">{isUr ? 'جمع (-)' : 'Credit (-)'}</th>
                  <th className="py-3 px-3 text-right w-32">{isUr ? 'بقایا بیلنس' : 'Balance'}</th>
                  <th className="py-3 px-2 text-center w-12">{isUr ? 'کارروائی' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        {isUr ? 'کوئی ٹرانزیکشن موجود نہیں' : 'No transactions recorded yet'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isUr
                          ? 'نیا ادھار مال دینے یا رقم وصولی کے لیے اوپر بٹن استعمال کریں۔'
                          : 'Add a credit purchase or payment recovery using the buttons above.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPurchase = tx.type === 'PURCHASE';
                    const isPayment = tx.type === 'PAYMENT';
                    const isOpening = tx.type === 'OPENING_BALANCE';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        {/* Date & Time */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {tx.dateStr}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {tx.timeStr}
                          </div>
                        </td>

                        {/* Transaction Type Badge */}
                        <td className="py-3 px-3 align-top whitespace-nowrap font-sans">
                          {isPurchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <ArrowUpRight className="w-3 h-3 text-amber-700" />
                              {isUr ? 'ادھار خریداری' : 'Credit Purchase'}
                            </span>
                          )}
                          {isPayment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                              {isUr ? 'وصولی رقم' : 'Payment Received'}
                            </span>
                          )}
                          {isOpening && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {isUr ? 'سابقہ بقایا' : 'Opening Balance'}
                            </span>
                          )}
                        </td>

                        {/* Description & Itemized entries */}
                        <td className="py-3 px-3 align-top font-sans">
                          <div className="font-semibold text-slate-800">
                            {tx.description}
                          </div>

                          {/* Items Breakdown */}
                          {tx.items && tx.items.length > 0 && (
                            <div className="mt-1.5 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-mono-num">
                              {tx.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="text-[11px] text-slate-600 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                    <span className="font-medium text-slate-800">{it.productName}</span>
                                    <span className="text-slate-400 font-mono-num">
                                      ({it.quantity} {it.unit} × Rs. {it.rate})
                                    </span>
                                  </div>
                                  <span className="font-bold text-slate-800">
                                    PKR {it.subtotal.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Payment Mode & Reference */}
                          {isPayment && (
                            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-bold">
                                {tx.paymentMode || 'CASH'}
                              </span>
                              {tx.referenceNo && (
                                <span className="text-slate-500 font-mono-num">Ref: {tx.referenceNo}</span>
                              )}
                            </div>
                          )}

                          {tx.notes && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5">
                              Note: {tx.notes}
                            </div>
                          )}
                        </td>

                        {/* Debit (+) */}
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap font-bold text-amber-900">
                          {tx.debit > 0 ? `PKR ${tx.debit.toLocaleString()}` : '-'}
                        </td>

                        {/* Credit (-) */}
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap font-bold text-emerald-700">
                          {tx.credit > 0 ? `PKR ${tx.credit.toLocaleString()}` : '-'}
                        </td>

                        {/* Running Balance */}
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap font-black text-slate-900">
                          PKR {tx.balanceAfter.toLocaleString()}
                        </td>

                        {/* Action: Delete */}
                        <td className="py-3 px-2 align-top text-center whitespace-nowrap">
                          <button
                            onClick={() => onDeleteTransaction(tx.id, tx.description)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title={isUr ? 'ٹرانزیکشن ڈیلیٹ کریں' : 'Delete transaction'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Summary Bar */}
        <div className="shrink-0 p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-6 font-mono-num">
            <div>
              <span className="text-slate-500 font-sans">{isUr ? 'کل خریداریاں (بنام): ' : 'Total Purchases: '}</span>
              <strong className="text-amber-900 font-bold">
                PKR {customer.totalDebit.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-sans">{isUr ? 'کل ادائیگیاں (جمع): ' : 'Total Payments: '}</span>
              <strong className="text-emerald-800 font-bold">
                PKR {customer.totalCredit.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-sans">{isUr ? 'موجودہ بقایا: ' : 'Current Balance: '}</span>
              <strong className="text-slate-900 font-black text-sm">
                PKR {customer.currentBalance.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenStatementPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isUr ? 'پرچی پرنٹ کریں' : 'Print Parchi'}</span>
            </button>
            <button
              onClick={() => onSendWhatsApp(customer)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUr ? 'واٹس ایپ بیلنس' : 'WhatsApp Balance'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors cursor-pointer"
            >
              {isUr ? 'بند کریں' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
