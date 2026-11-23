import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, CreditCard, Building2, CheckCircle2, FileText } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { NumberInput } from '../common/NumberInput';
import type { Supplier } from '../../types';

interface PaySupplierModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

export const PaySupplierModal: React.FC<PaySupplierModalProps> = ({
  isOpen,
  supplier,
  onClose
}) => {
  const { addSupplierPayment, language, suppliers } = usePos();
  const isUr = language === 'ur';

  const [selectedSuppId, setSelectedSuppId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'RAAST' | 'BANK' | 'CHEQUE'>('BANK');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSuppId(supplier?.id || suppliers[0]?.id || '');
      setAmount(0);
      setPaymentMode('BANK');
      setReferenceNo('');
      setNotes('');
    }
  }, [isOpen, supplier, suppliers]);

  if (!isOpen) return null;

  const currentSupp = suppliers.find((s) => s.id === selectedSuppId) || supplier;
  const currentBalance = currentSupp?.currentBalance || 0;
  const remainingBalanceAfter = Math.max(0, currentBalance - amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuppId) {
      notifyWarning(isUr ? 'سپلائر / مل منتخب کریں' : 'Please select a supplier');
      return;
    }
    if (amount <= 0) {
      notifyWarning(isUr ? 'درست ادائیگی رقم درج کریں' : 'Please enter a valid payment amount');
      return;
    }

    addSupplierPayment(selectedSuppId, {
      paidAmount: amount,
      paymentMode,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined
    });

    notifySuccess(
      isUr
        ? `ادائیگی PKR ${amount.toLocaleString()} کامیابی سے مل کے کھاتے میں درج ہو گئی!`
        : `Payment of PKR ${amount.toLocaleString()} recorded successfully!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-6 border border-emerald-900/20">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-blue-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isUr ? 'مل کو ادائیگی کا اندراج' : 'Record Supplier Payment'}</h2>
              <p className="text-xs text-blue-200">{currentSupp?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-blue-800 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Supplier Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'سپلائر / مل منتخب کریں' : 'Select Supplier / Mill'}
            </label>
            <select
              value={selectedSuppId}
              onChange={(e) => setSelectedSuppId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 font-bold text-slate-800"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (بقایا: PKR {s.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-rose-800 font-bold">
              {isUr ? 'موجودہ واجب الادا بقایا رقم (دینا ہے):' : 'Current Outstanding Due (Payable):'}
            </span>
            <span className="text-base font-black text-rose-950">PKR {currentBalance.toLocaleString()}</span>
          </div>

          {/* Payment Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-700 font-bold">
                {isUr ? 'ادائیگی رقم (PKR) *' : 'Payment Amount (PKR) *'}
              </label>
              {currentBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance)}
                  className="text-[10px] text-blue-700 hover:underline font-bold"
                >
                  {isUr ? 'مکمل بقایا رقم درج کریں' : 'Full Settle'}
                </button>
              )}
            </div>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <NumberInput
                value={amount}
                onChange={setAmount}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-black text-lg text-slate-900 bg-blue-50/30"
              />
            </div>
          </div>

          {/* Remaining Balance Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              {isUr ? 'ادائیگی کے بعد نیا بقایا:' : 'Remaining Balance After Payment:'}
            </span>
            <span className="font-bold text-slate-900">
              PKR {remainingBalanceAfter.toLocaleString()}
            </span>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              {isUr ? 'طریقہ ادائیگی *' : 'Payment Channel *'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('BANK')}
                className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'BANK'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span>{isUr ? 'بینک ٹرانسفر' : 'Bank Transfer'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('RAAST')}
                className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'RAAST'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>{isUr ? 'راسٹ (Raast)' : 'Raast Instant'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-700" />
                <span>{isUr ? 'نقد (کیش)' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CHEQUE')}
                className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'CHEQUE'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-700" />
                <span>{isUr ? 'چیک (Cheque)' : 'Cheque'}</span>
              </button>
            </div>
          </div>

          {/* Reference / Cheque / Slip No */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {paymentMode === 'CHEQUE'
                ? (isUr ? 'چیک نمبر و تاریخ' : 'Cheque No. & Due Date')
                : paymentMode === 'BANK' || paymentMode === 'RAAST'
                ? (isUr ? 'بینک ٹرانزیکشن ریفرنس / سلپ نمبر' : 'Bank Reference / Transaction ID')
                : (isUr ? 'رسید نمبر یا وصول کنندہ' : 'Receipt No. / Receiver Name')}
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder={paymentMode === 'CHEQUE' ? 'e.g. HBL Cheque # 981240' : 'e.g. FT-992144'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 font-semibold"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'نوٹس' : 'Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={isUr ? 'مثلاً ڈرائیور کے ہاتھ کیش روانہ کیا یا مل مینیجر کو آن لائن بھیجا۔' : 'e.g. Online transfer to mill manager account'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
            >
              {isUr ? 'منسوخ کریں' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUr ? 'ادائیگی درج کریں' : 'Confirm Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
