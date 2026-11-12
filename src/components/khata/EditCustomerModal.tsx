import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Store, Phone, MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import type { KhataCustomer } from '../../types';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';

interface EditCustomerModalProps {
  isOpen: boolean;
  customer: KhataCustomer | null;
  onClose: () => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  customer,
  onClose
}) => {
  const { updateKhataCustomer, deleteKhataCustomer, language } = usePos();
  const isUr = language === 'ur';

  const [customerName, setCustomerName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [notes, setNotes] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.customerName);
      setUrduName(customer.urduName || '');
      setShopName(customer.shopName);
      setPhone(customer.phone);
      setAddress(customer.address);
      setCreditLimit(customer.creditLimit || 50000);
      setNotes(customer.notes || '');
      setShowDeleteConfirm(false);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() && !shopName.trim()) {
      notifyWarning('Please enter customer or shop name');
      return;
    }

    updateKhataCustomer(customer.id, {
      customerName: customerName.trim(),
      urduName: urduName.trim() || customerName.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      creditLimit,
      notes: notes.trim()
    });

    notifySuccess(isUr ? 'کھاتہ معلومات اپڈیٹ ہو گئی!' : 'Customer Khata updated successfully!');
    onClose();
  };

  const handleDelete = () => {
    deleteKhataCustomer(customer.id);
    notifySuccess(isUr ? `${customer.shopName} کا کھاتہ ڈیلیٹ کر دیا گیا` : `Deleted khata for ${customer.shopName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs my-4">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>{isUr ? 'کھاتہ معلومات تبدیل کریں' : 'Edit Customer Account'}</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                {isUr ? (customer.urduName || customer.shopName) : customer.shopName} ({customer.customerName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Box */}
        {showDeleteConfirm ? (
          <div className="p-5 space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3 text-red-900">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold">
                  {isUr ? 'کیا آپ واقعی یہ کھاتہ مکمل ڈیلیٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this Khata account?'}
                </h3>
                <p className="text-[11px] text-red-700 mt-1">
                  {isUr
                    ? 'اس کھاتے کا تمام سابقہ ریکارڈ، خریداری اور ادائیگیوں کی تاریخ ہمیشہ کے لیے ختم ہو جائے گی۔'
                    : 'All ledger entries, purchases, and payment history for this customer will be permanently removed.'}
                </p>
                {customer.currentBalance > 0 && (
                  <div className="mt-2 text-xs font-black text-red-800 bg-white/80 p-2 rounded border border-red-300 font-mono-num">
                    {isUr
                      ? `خبردار: اس کسٹمر کے ذمے ابھی PKR ${customer.currentBalance.toLocaleString()} بقایا باقی ہے!`
                      : `Warning: This customer still has PKR ${customer.currentBalance.toLocaleString()} outstanding balance!`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                {isUr ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
              >
                {isUr ? 'ہاں، کھاتہ ڈیلیٹ کریں' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'دکان کا نام:' : 'Shop / Business Name:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-medium text-slate-900"
                />
                <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUr ? 'مالک / خریدار کا نام:' : 'Owner / Customer Name:'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden text-slate-900 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span>{isUr ? 'کھاتہ کا اردو ٹائٹل:' : 'Urdu Title:'}</span>
                  </label>
                  {(shopName || customerName) && (
                    <button
                      type="button"
                      onClick={() => setUrduName(transliterateEnglishToUrduName(shopName || customerName))}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5 underline"
                      title={isUr ? 'خودکار ترجمہ کریں' : 'Auto Transliterator'}
                    >
                      <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                      <span>{isUr ? 'خودکار' : 'Auto Sync'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  dir="rtl"
                  placeholder={isUr ? 'انگریزی نام سے خودکار اردو بنے گی...' : 'Auto-generated title...'}
                  value={urduName}
                  onChange={(e) => setUrduName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUr ? 'موبائل نمبر:' : 'Mobile Phone:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono text-slate-900"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isUr ? 'ادھار کی حد:' : 'Credit Limit:'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'دکان کا پتہ / علاقہ:' : 'Shop Address / Area:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden text-slate-900"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'نوٹس:' : 'Notes:'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isUr ? 'ڈیلیٹ کھاتہ' : 'Delete Account'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {isUr ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  {isUr ? 'محفوظ کریں' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
