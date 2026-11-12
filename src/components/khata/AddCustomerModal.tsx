import React, { useState, useEffect } from 'react';
import { X, UserPlus, Store, Phone, MapPin, DollarSign, FileText, Sparkles } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addKhataCustomer, language } = usePos();
  const isUr = language === 'ur';

  const [customerName, setCustomerName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [isUrduManuallyEdited, setIsUrduManuallyEdited] = useState<boolean>(false);
  const [shopName, setShopName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setUrduName('');
      setIsUrduManuallyEdited(false);
      setShopName('');
      setPhone('');
      setAddress('');
      setOpeningBalance(0);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShopNameChange = (val: string) => {
    setShopName(val);
    if (!isUrduManuallyEdited) {
      setUrduName(transliterateEnglishToUrduName(val || customerName));
    }
  };

  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (!isUrduManuallyEdited && !shopName.trim()) {
      setUrduName(transliterateEnglishToUrduName(val));
    }
  };

  const handleUrduNameChange = (val: string) => {
    setUrduName(val);
    if (!val.trim()) {
      setIsUrduManuallyEdited(false);
      setUrduName(transliterateEnglishToUrduName(shopName || customerName));
    } else {
      setIsUrduManuallyEdited(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() && !shopName.trim()) {
      notifyWarning(isUr ? 'کسٹمر یا دکان کا نام درج کریں' : 'Please enter customer or shop name');
      return;
    }

    const created = addKhataCustomer({
      customerName: customerName.trim() || shopName.trim(),
      urduName: urduName.trim() || transliterateEnglishToUrduName(shopName.trim() || customerName.trim()) || shopName.trim() || customerName.trim(),
      shopName: shopName.trim() || customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      creditLimit,
      openingBalance: Math.max(0, openingBalance),
      notes: notes.trim()
    });

    notifySuccess(isUr ? `${created.urduName || created.shopName} کا نیا کھاتہ کھل گیا!` : `Khata opened successfully for ${created.shopName || created.customerName}!`);
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
                <span>{isUr ? 'نیا ادھار کھاتہ کھولیں' : 'Open New Khata Account'}</span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                {isUr ? 'کسٹمر، دکاندار یا ہوٹل کا کھاتہ بک میں اندراج کریں' : 'Register a new credit buyer, merchant, or restaurant'}
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
              {isUr ? 'دکان یا کاروبار کا نام:' : 'Shop / Business Name:'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={isUr ? 'مثلاً حاجی رشید کریانہ اسٹور / مدینہ ہوٹل' : 'e.g. Haji Rasheed Store / Madina Hotel'}
                value={shopName}
                onChange={(e) => handleShopNameChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-medium text-slate-900"
              />
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Customer Person Name & Urdu Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'خریدار / مالک کا نام:' : 'Customer / Owner Name:'}
              </label>
              <input
                type="text"
                placeholder={isUr ? 'مثلاً حاجی رشید احمد' : 'e.g. Haji Rasheed Ahmed'}
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden text-slate-900 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span>{isUr ? 'کھاتہ کا اردو ٹائٹل:' : 'Urdu Title:'}</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                    <span>{isUr ? 'خودکار' : 'Auto'}</span>
                  </span>
                </label>
                {isUrduManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUrduManuallyEdited(false);
                      setUrduName(transliterateEnglishToUrduName(shopName || customerName));
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                    title={isUr ? 'دوبارہ خودکار کریں' : 'Reset to Auto'}
                  >
                    <span>{isUr ? 'خودکار ری سیٹ' : 'Reset Auto'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                dir="rtl"
                placeholder={isUr ? 'انگریزی نام سے خودکار اردو بنے گی...' : 'Auto-generated title...'}
                value={urduName}
                onChange={(e) => handleUrduNameChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 transition-colors"
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'موبائل نمبر:' : 'Mobile / WhatsApp No:'}
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
                {isUr ? 'دکان کا پتہ / علاقہ:' : 'Shop Address / Location:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isUr ? 'مثلاً دکان نمبر 14، منڈی موڑ' : 'e.g. Shop #14, Grain Market'}
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
                {isUr ? 'سابقہ پرانا بقایا:' : 'Opening Balance (if any):'}
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
              <span className="text-[9px] text-slate-400 mt-0.5 block">
                {isUr ? 'اگر پرانا ادھار باقی ہو تو درج کریں' : 'Prior unpaid credit balance'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {isUr ? 'مقررہ ادھار حد:' : 'Credit Limit:'}
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
              <span className="text-[9px] text-slate-400 mt-0.5 block">
                {isUr ? 'زیادہ سے زیادہ ادھار کی حد' : 'Maximum authorized balance'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isUr ? 'خصوصی نوٹس / شرائط:' : 'Terms & Remarks (Optional):'}
            </label>
            <textarea
              rows={2}
              placeholder={isUr ? 'مثلاً ہر جمعرات کو پیمنٹ کلیئر کرتا ہے...' : 'e.g. Clears balance weekly every Thursday...'}
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
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isUr ? '+ کھاتہ کھولیں' : '+ Open Khata'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
