import React, { useState } from 'react';
import { X, UserPlus, Store, Phone, MapPin, DollarSign, FileText } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addKhataCustomer } = usePos();

  const [customerName, setCustomerName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() && !shopName.trim()) {
      notifyWarning('Please enter customer or shop name (کسٹمر یا دکان کا نام درج کریں)');
      return;
    }

    const created = addKhataCustomer({
      customerName: customerName.trim() || shopName.trim(),
      urduName: urduName.trim() || shopName.trim() || customerName.trim(),
      shopName: shopName.trim() || customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      creditLimit,
      openingBalance: Math.max(0, openingBalance),
      notes: notes.trim()
    });

    notifySuccess(`Khata opened successfully for ${created.shopName || created.customerName}! (کھاتہ کھل گیا)`);
    // Reset form
    setCustomerName('');
    setUrduName('');
    setShopName('');
    setPhone('');
    setAddress('');
    setOpeningBalance(0);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs my-4">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>نیا ادھار کھاتہ کھولیں</span>
                <span className="text-emerald-200 font-normal text-xs">(Open New Khata Account)</span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                کسٹمر، دکاندار یا ہوٹل کا مستقل کھاتہ بک میں اندراج کریں
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Shop / Business Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              دکان یا کاروبار کا نام (Shop / Business Name): <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثلاً حاجی رشید کریانہ اسٹور / مدینہ ہوٹل"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-medium text-slate-900"
              />
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Customer Person Name & Urdu Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                مالک / خریدار کا نام (Customer Name):
              </label>
              <input
                type="text"
                placeholder="مثلاً حاجی رشید احمد"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اردو ٹائٹل (Urdu Display Title):
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="حاجی رشید کریانہ"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden urdu-text text-sm font-medium"
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                موبائل نمبر (Mobile / WhatsApp No):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono text-slate-900"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                دکان کا پتہ / علاقہ (Shop Location):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثلاً دکان نمبر 14، منڈی موڑ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden text-slate-900"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Opening Balance & Credit Limit */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                سابقہ پرانا بقایا (Opening Balance if any):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono-num text-slate-900"
                />
                <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Rs</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block">اگر پرانا ادھار باقی ہو تو درج کریں</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                مقررہ ادھار حد (Credit Limit):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono-num text-slate-900"
                />
                <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Rs</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block">زیادہ سے زیادہ ادھار کی حد</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              خصوصی نوٹس / شرائط (Terms & Notes):
            </label>
            <textarea
              rows={2}
              placeholder="مثلاً ہر جمعرات کو پیمنٹ کلیئر کرتا ہے..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel (منسوخ)
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>کھاتہ کھولیں (Open Khata)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
