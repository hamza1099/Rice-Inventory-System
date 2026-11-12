import React, { useRef } from 'react';
import { X, Printer, Phone, MapPin } from 'lucide-react';
import type { KhataCustomer, KhataTransaction } from '../../types';
import { usePos } from '../../context/PosContext';

interface KhataStatementPrintModalProps {
  isOpen?: boolean;
  customer: KhataCustomer;
  transactions: KhataTransaction[];
  onClose: () => void;
}

export const KhataStatementPrintModal: React.FC<KhataStatementPrintModalProps> = ({
  isOpen = true,
  customer,
  transactions,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { language } = usePos();
  const isUr = language === 'ur';

  if (!isOpen) return null;

  // Sort transactions chronologically (oldest to newest for official statement)
  const sortedTxns = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Print-specific style tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #khata-printable-parchi, #khata-printable-parchi * {
            visibility: visible;
          }
          #khata-printable-parchi {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 16px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 border border-emerald-900/20 max-h-[92vh] flex flex-col">
        {/* Header Actions */}
        <div className="no-print bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isUr ? 'کھاتہ پرچی و گوشوارہ' : 'Khata Statement & Parchi'}</h2>
              <p className="text-xs text-emerald-200">
                {isUr ? `کھاتہ نقل برائے ${customer.urduName || customer.shopName}` : `Official Account Statement for ${customer.shopName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isUr ? 'پرنٹ کریں' : 'Print Statement'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-800 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div
            id="khata-printable-parchi"
            ref={printAreaRef}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto text-slate-800"
          >
            {/* Mandi Header */}
            <div className="border-b-2 border-emerald-900 pb-4 mb-5 text-center relative">
              <div className="flex justify-between items-start">
                <div className="text-left text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">NTN: 4829104-7</p>
                  <p>Grain Market License # 104-OK</p>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-black text-emerald-950 tracking-wide font-serif">
                    BUKHARI RICE TRADERS
                  </h1>
                  <h2 className="text-lg font-bold text-emerald-800 font-sans mt-0.5">
                    {isUr ? 'بخاری رائس ٹریڈرز (کمیشن ایجنٹس و غلہ آڑھت)' : 'Commission Agents & Wholesale Grain Market'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {isUr ? 'غلہ منڈی، دیپالپور روڈ، اوکاڑہ | فون: 0300-7589211' : 'Main Grain Market, Depalpur Road, Okara | Ph: +92 300 7589211, +92 44 2521190'}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Date: {currentDateStr}</p>
                  <p>Time: {currentTimeStr}</p>
                </div>
              </div>
              <div className="mt-3 inline-block bg-emerald-900 text-white px-4 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
                {isUr ? 'ادھار کھاتہ نقل' : 'Customer Ledger Statement'}
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{isUr ? 'دکان یا گاہک کا نام:' : 'Khata Holder / Shop:'}</p>
                <p className="text-base font-bold text-slate-900">{isUr ? (customer.urduName || customer.shopName) : customer.shopName}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {isUr ? 'مالک:' : 'Proprietor:'} <span className="font-medium text-slate-800">{customer.customerName}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase">{isUr ? 'رابطہ و حد ادھار:' : 'Contact & Credit Limit:'}</p>
                <p className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.phone || (isUr ? 'فون نمبر نہیں' : 'No Phone')}
                </p>
                {customer.address && (
                  <p className="text-xs text-slate-600 flex items-center justify-end gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {customer.address}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {isUr ? 'حد ادھار:' : 'Credit Limit:'} <span className="font-semibold text-slate-700">PKR {(customer.creditLimit || 0).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Account Summary Strip */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-semibold uppercase">{isUr ? 'کل خریداری (بنام)' : 'Total Purchases (Debit)'}</p>
                <p className="text-lg font-black text-amber-900 mt-0.5">
                  PKR {customer.totalDebit.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-700 font-semibold uppercase">{isUr ? 'کل ادائیگی (جمع)' : 'Total Paid (Credit)'}</p>
                <p className="text-lg font-black text-emerald-900 mt-0.5">
                  PKR {customer.totalCredit.toLocaleString()}
                </p>
              </div>
              <div className={`rounded-lg p-3 border ${
                customer.currentBalance > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider">{isUr ? 'بقایا واجب الادا' : 'Net Balance'}</p>
                <p className="text-xl font-black mt-0.5">
                  PKR {customer.currentBalance.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium mt-0.5">
                  {customer.currentBalance > 0 ? (isUr ? 'واجب الادا بقایا رقم' : 'Outstanding Balance Due') : (isUr ? 'کھاتہ مکمل بیباق ہے' : 'Zero Balance / Fully Settled')}
                </p>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div className="mb-6 overflow-hidden rounded-lg border border-slate-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-28">{isUr ? 'تاریخ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{isUr ? 'تفصیل خریداری / ادائیگی' : 'Description & Items'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isUr ? 'بنام (+)' : 'Debit (+)'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isUr ? 'جمع (-)' : 'Credit (-)'}</th>
                    <th className="py-2.5 px-3 text-right w-28">{isUr ? 'بقایا' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedTxns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        {isUr ? 'کوئی ٹرانزیکشن ریکارڈ نہیں ہے۔' : 'No transactions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    sortedTxns.map((txn, idx) => {
                      const isPayment = txn.type === 'PAYMENT';

                      return (
                        <tr key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap text-slate-600 font-medium">
                            {txn.dateStr}
                            <div className="text-[10px] text-slate-400">
                              {txn.timeStr}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 align-top">
                            <div className="font-semibold text-slate-800">
                              {txn.description}
                            </div>

                            {/* Itemized List if purchase */}
                            {txn.items && txn.items.length > 0 && (
                              <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-slate-200">
                                {txn.items.map((it, itemIdx) => (
                                  <div key={itemIdx} className="text-[11px] text-slate-600 flex justify-between">
                                    <span>
                                      • {isUr ? (it.urduName || it.productName) : it.productName} ({it.quantity} {isUr && it.unit === 'kg' ? 'کلو' : it.unit} @ Rs. {it.rate})
                                    </span>
                                    <span className="font-medium text-slate-700">Rs. {it.subtotal.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Payment mode details */}
                            {isPayment && (
                              <div className="text-[11px] text-emerald-700 mt-0.5">
                                {isUr ? 'طریقہ ادائیگی:' : 'Mode:'} <span className="font-semibold uppercase">{txn.paymentMode || 'Cash'}</span>
                                {txn.referenceNo && ` • Ref: ${txn.referenceNo}`}
                              </div>
                            )}

                            {txn.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{txn.notes}</div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-bold text-amber-900 whitespace-nowrap">
                            {txn.debit > 0 ? `PKR ${txn.debit.toLocaleString()}` : '-'}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-bold text-emerald-700 whitespace-nowrap">
                            {txn.credit > 0 ? `PKR ${txn.credit.toLocaleString()}` : '-'}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-black text-slate-900 whitespace-nowrap">
                            PKR {txn.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-slate-700">
                      {isUr ? 'کل میزان:' : 'Total Ledger Summary:'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-900">
                      PKR {customer.totalDebit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-800">
                      PKR {customer.totalCredit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-base text-slate-900 font-black">
                      PKR {customer.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Legal Notice */}
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded p-3 mb-8">
              <p className="font-semibold text-slate-700">{isUr ? 'اہم ہدایات:' : 'Terms of Credit & Important Instructions:'}</p>
              {isUr ? (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[12px] text-slate-600">
                  <li>تمام سودے غلہ منڈی اوکاڑہ کے مقررہ قواعد و ضوابط کے تحت طے پاتے ہیں۔</li>
                  <li>کسی بھی اندراج میں اختلاف کی صورت میں 3 یوم کے اندر اندر دفتر سے رابطہ فرما کر تصحیح کرائیں۔</li>
                  <li>براہ کرم ادائیگی کے بعد کمپیوٹرائزڈ پرچی وصول فرما کر ریکارڈ اپنے پاس محفوظ رکھیں۔</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] text-slate-600">
                  <li>All trades governed by Okara Grain Market standards and regulations.</li>
                  <li>In case of any discrepancy, please notify the office within 3 days for rectification.</li>
                  <li>Kindly retain official computerized receipts upon payment for your records.</li>
                </ul>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-300 text-xs text-center">
              <div>
                <div className="w-44 border-b border-slate-400 mx-auto mb-1.5 h-8"></div>
                <p className="font-semibold text-slate-800">{isUr ? 'دستخط منشی / کیشیئر' : 'Prepared By / Cashier'}</p>
                <p className="text-[10px] text-slate-400">Bukhari Rice Traders Terminal</p>
              </div>
              <div>
                <div className="w-44 border-b border-slate-400 mx-auto mb-1.5 h-8"></div>
                <p className="font-semibold text-slate-800">{isUr ? 'دستخط خریدار / مہر' : 'Customer Signature / Stamp'}</p>
                <p className="text-[10px] text-slate-400">{isUr ? (customer.urduName || customer.shopName) : customer.shopName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print bg-slate-100 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Khata ID: #{customer.id} • Registered: {customer.createdAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            {isUr ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
