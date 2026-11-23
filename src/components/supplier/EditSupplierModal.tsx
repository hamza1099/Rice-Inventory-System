import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { PakistaniPhoneInput } from '../common/PakistaniPhoneInput';
import { isValidPakistaniPhone } from '../../utils/phone';
import type { Supplier } from '../../types';

interface EditSupplierModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ isOpen, supplier, onClose }) => {
  const { updateSupplier, language } = usePos();
  const isUr = language === 'ur';

  const [name, setName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'SETTLED'>('ACTIVE');

  useEffect(() => {
    if (isOpen && supplier) {
      setName(supplier.name);
      setUrduName(supplier.urduName || '');
      setContactPerson(supplier.contactPerson || '');
      setPhone(supplier.phone);
      setCity(supplier.city);
      setAddress(supplier.address || '');
      setNotes(supplier.notes || '');
      setStatus(supplier.status);
    }
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifyWarning(isUr ? 'مل یا سپلائر کا نام درج کریں' : 'Please enter mill or supplier name');
      return;
    }
    if (phone.trim() && !isValidPakistaniPhone(phone, false)) {
      notifyWarning(
        isUr
          ? 'درست ۱۱ ہندسی موبائل نمبر درج کریں'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    updateSupplier(supplier.id, {
      name: name.trim(),
      urduName: urduName.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      city: city.trim() || 'Rawalpindi',
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      status
    });

    notifySuccess(
      isUr
        ? `سپلائر "${urduName || name}" کی تفصیلات اپ ڈیٹ ہو گئیں!`
        : `Supplier "${name}" updated successfully!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-6 border border-emerald-900/20">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isUr ? 'مل / سپلائر کھاتہ تبدیل کریں' : 'Edit Mill / Supplier Details'}</h2>
              <p className="text-xs text-emerald-200">{supplier.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Mill / Supplier Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'مل یا فرم کا نام (English) *' : 'Mill / Supplier Business Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-slate-800"
            />
          </div>

          {/* Urdu Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'مل کا نام اردو میں' : 'Mill Name in Urdu'}
            </label>
            <input
              type="text"
              value={urduName}
              onChange={(e) => setUrduName(e.target.value)}
              dir="rtl"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-slate-900 font-sans text-sm bg-emerald-50/40"
            />
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'مالک / رابطہ کار' : 'Proprietor / Contact Person'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'موبائل نمبر (واٹس ایپ)' : 'Mobile / WhatsApp Number'}
              </label>
              <PakistaniPhoneInput
                value={phone}
                onChange={setPhone}
              />
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'شہر / غلہ منڈی *' : 'City / Mandi Hub *'}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'ایڈریس' : 'Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'کھاتہ کی حالت' : 'Account Status'}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="suppStatus"
                  value="ACTIVE"
                  checked={status === 'ACTIVE'}
                  onChange={() => setStatus('ACTIVE')}
                  className="text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-semibold text-emerald-800">{isUr ? 'جاری / فعال (Active)' : 'Active (Trading)'}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="suppStatus"
                  value="SETTLED"
                  checked={status === 'SETTLED'}
                  onChange={() => setStatus('SETTLED')}
                  className="text-slate-600 focus:ring-slate-500"
                />
                <span className="font-semibold text-slate-700">{isUr ? 'بیباق / بند (Settled)' : 'Settled / Inactive'}</span>
              </label>
            </div>
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
