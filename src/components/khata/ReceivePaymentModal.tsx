import React, { useState } from 'react';
import { X, HandCoins, CheckCircle2, Wallet, Building2, CreditCard, FileCheck } from 'lucide-react';
import type { KhataCustomer } from '../../types';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  customer: KhataCustomer | null;
  onClose: () => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  customer,
  onClose
}) => {
  const { addKhataPayment, language } = usePos();
  const isUr = language === 'ur';

  const [amount, setAmount] = useState<number>(customer ? customer.currentBalance : 0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'RAAST' | 'BANK' | 'CHEQUE'>('CASH');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !customer) return null;

  const remainingBalance = Math.max(0, customer.currentBalance - amount);
  const isFullySettled = remainingBalance === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      notifyWarning(isUr ? 'درست وصولی رقم درج کریں' : 'Please enter a valid payment amount');
      return;
    }

    addKhataPayment(
      customer.id,
      amount,
      paymentMode,
      notes.trim() || (isUr ? `${customer.customerName || customer.shopName} سے موصول` : `Paid by ${customer.customerName || customer.shopName}`),
      referenceNo.trim()
    );

    if (isFullySettled) {
      notifySuccess(
        isUr
          ? `کھاتہ مکمل صاف ہو گیا! ${customer.urduName || customer.shopName} سے Rs. ${amount.toLocaleString()} موصول۔`
          : `Khata fully cleared! Rs. ${amount.toLocaleString()} received from ${customer.shopName}.`
      );
    } else {
      notifySuccess(
        isUr
          ? `Rs. ${amount.toLocaleString()} کی وصولی درج ہو گئی!`
          : `Payment of Rs. ${amount.toLocaleString()} received! Remaining balance: PKR ${remainingBalance.toLocaleString()}`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-xs my-4">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HandCoins className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>{isUr ? 'ادھار کھاتہ رقم وصولی اندراج' : 'Receive Khata Payment'}</span>
              </h2>
              <p className="text-[11px] text-emerald-100 font-mono-num">
                {isUr ? (customer.urduName || customer.shopName) : customer.shopName} • {isUr ? 'کل واجب الادا:' : 'Current Due:'} PKR {customer.currentBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Outstanding Box */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between font-mono-num">
            <div>
              <span className="text-[10px] text-amber-800 font-sans block font-semibold">
                {isUr ? 'کل سابقہ واجب الادا:' : 'Current Due Balance:'}
              </span>
              <span className="text-xl font-black text-amber-950">
                PKR {customer.currentBalance.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(customer.currentBalance)}
              className="px-2.5 py-1 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[10px] cursor-pointer transition-colors"
            >
              {isUr ? 'پوری رقم بھریں' : 'Full Pay'}
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 mb-1">
              {isUr ? 'وصول شدہ رقم:' : 'Amount Received:'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="10"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-xl font-black font-mono-num pl-9 pr-3 py-2 bg-white border-2 border-emerald-600 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="absolute left-3 top-2.5 font-black text-sm text-slate-400">Rs</span>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {customer.currentBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(customer.currentBalance)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                >
                  {isUr ? 'مکمل' : 'Full'} (PKR {customer.currentBalance.toLocaleString()})
                </button>
              )}
              {customer.currentBalance > 1000 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(customer.currentBalance / 2))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                >
                  {isUr ? 'نصف' : 'Half'} (PKR {Math.round(customer.currentBalance / 2).toLocaleString()})
                </button>
              )}
              {[1000, 5000, 10000, 20000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono-num font-semibold text-[10px]"
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {isUr ? 'طریقہ ادائیگی:' : 'Payment Mode:'}
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-bold text-[11px]">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>{isUr ? 'نقد' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('RAAST')}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                  paymentMode === 'RAAST'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{isUr ? 'راست' : 'Raast'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('BANK')}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                  paymentMode === 'BANK'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{isUr ? 'بینک' : 'Bank'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CHEQUE')}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                  paymentMode === 'CHEQUE'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>{isUr ? 'چیک' : 'Cheque'}</span>
              </button>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'رسید / حوالہ نمبر:' : 'Receipt / Ref No:'}
              </label>
              <input
                type="text"
                placeholder={isUr ? 'مثلاً RCPT-501 / راست حوالہ' : 'e.g. RCPT-501 / Raast Ref'}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'تفصیل / نوٹس:' : 'Notes / Remarks:'}
              </label>
              <input
                type="text"
                placeholder={isUr ? 'مثلاً کسٹمر نے خود نقد دی' : 'e.g. Paid in cash by customer'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900"
              />
            </div>
          </div>

          {/* Live Remaining Balance Calculation Preview */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between font-mono-num transition-all ${
              isFullySettled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div>
              <span className="text-[10px] block font-sans opacity-80">
                {isUr ? 'وصولی کے بعد نیا بقیہ:' : 'Remaining Balance After Payment:'}
              </span>
              <span className="text-xl font-black">
                PKR {remainingBalance.toLocaleString()}
              </span>
            </div>

            {isFullySettled ? (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isUr ? 'کھاتہ صاف' : 'Zero Balance'}</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                {isUr ? 'بقیہ واجب الادا' : 'Balance Remaining'}
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <HandCoins className="w-4 h-4" />
              <span>{isUr ? 'وصولی درج کریں' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
