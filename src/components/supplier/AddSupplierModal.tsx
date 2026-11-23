import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, MapPin, DollarSign, FileText, Sparkles } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { isValidPakistaniPhone } from '../../utils/phone';
import { NumberInput } from '../common/NumberInput';
import { PakistaniPhoneInput } from '../common/PakistaniPhoneInput';
import type { Supplier } from '../../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated?: (supp: Supplier) => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSupplierCreated }) => {
  const { addSupplier, language } = usePos();
  const isUr = language === 'ur';

  const [name, setName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [isUrduManuallyEdited, setIsUrduManuallyEdited] = useState<boolean>(false);
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUrduName('');
      setIsUrduManuallyEdited(false);
      setContactPerson('');
      setPhone('');
      setCity('');
      setAddress('');
      setOpeningBalance(0);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isUrduManuallyEdited) {
      setUrduName(transliterateEnglishToUrduName(val));
    }
  };

  const handleUrduNameChange = (val: string) => {
    setUrduName(val);
    if (!val.trim()) {
      setIsUrduManuallyEdited(false);
      setUrduName(transliterateEnglishToUrduName(name));
    } else {
      setIsUrduManuallyEdited(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifyWarning(isUr ? 'مل یا سپلائر کا نام درج کریں' : 'Please enter mill or supplier name');
      return;
    }
    if (phone.trim() && !isValidPakistaniPhone(phone, false)) {
      notifyWarning(
        isUr
          ? 'درست ۱۱ ہندسی موبائل نمبر درج کریں (مثلاً 0300-1234567)'
          : 'Please enter a valid 11-digit mobile number (e.g. 0300-1234567)'
      );
      return;
    }

    const created = addSupplier({
      name: name.trim(),
      urduName: urduName.trim() || transliterateEnglishToUrduName(name.trim()) || name.trim(),
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      city: city.trim() || 'Rawalpindi',
      address: address.trim() || undefined,
      openingBalance: openingBalance > 0 ? openingBalance : 0,
      notes: notes.trim() || undefined
    });

    notifySuccess(
      isUr
        ? `نیا سپلائر / مل "${created.urduName || created.name}" کھاتے میں شامل ہو گیا!`
        : `Supplier / Mill "${created.name}" successfully added to Khata!`
    );

    if (onSupplierCreated) {
      onSupplierCreated(created);
    }
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
              <h2 className="text-lg font-bold">{isUr ? 'نیا مل / سپلائر کھاتہ درج کریں' : 'Add New Mill / Supplier'}</h2>
              <p className="text-xs text-emerald-200">{isUr ? 'چاول ملز، شیلر، غلہ آڑھت یا دکان دار' : 'Rice Mills, Shellers, Mandi Stockists'}</p>
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
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isUr ? 'مثلاً رائل رائس ملز اینڈ شیلر' : 'e.g. Royal Rice Mills & Sheller'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Urdu Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-700 font-semibold">
                {isUr ? 'مل کا نام اردو میں (پرچی و کھاتہ شیٹ پرنٹ کیلئے)' : 'Mill Name in Urdu (For Official Statements)'}
              </label>
              <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {isUrduManuallyEdited ? (isUr ? 'خود تبدیل شدہ' : 'Custom') : (isUr ? 'خودکار ترجمہ' : 'Auto Generated')}
              </span>
            </div>
            <input
              type="text"
              value={urduName}
              onChange={(e) => handleUrduNameChange(e.target.value)}
              placeholder="مثلاً الرحمان رائس ملز اینڈ شیلر"
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
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder={isUr ? 'مثلاً سیٹھ طارق رحمان' : 'e.g. Seth Tariq Rehman'}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'موبائل نمبر (واٹس ایپ)' : 'Mobile / WhatsApp Number'}
              </label>
              <PakistaniPhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="0300-1234567"
              />
            </div>
          </div>

          {/* City / Mandi & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'شہر / غلہ منڈی *' : 'City / Mandi Hub *'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isUr ? 'مثلاً ڈسکہ، حافظ آباد، کامونکی' : 'e.g. Daska, Hafizabad, Kamoke'}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'ایڈریس / مل کا پتہ' : 'Mill Location / Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isUr ? 'پسرور روڈ، نزد شیلر اسٹاپ' : 'Pasrur Road, Near Sheller Stop'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>
          </div>

          {/* Opening Balance (Payable to Mill) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
            <label className="block text-amber-900 font-bold flex items-center justify-between">
              <span>{isUr ? 'سابقہ پرانا کھاتہ (واجب الادا بقایا رقم):' : 'Opening Balance (Old Balance We Owe):'}</span>
              <span className="text-[10px] text-amber-700 font-normal">{isUr ? 'اگر پہلے کے پیسے دینے ہوں' : 'If existing balance payable'}</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
              <NumberInput
                value={openingBalance}
                onChange={setOpeningBalance}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-950 bg-white"
              />
            </div>
            <p className="text-[10px] text-amber-700">
              {isUr
                ? 'نوٹ: یہ رقم کھاتہ شروع کرتے وقت مل کے ذمہ واجب الادا (Payable) بیلنس میں درج ہو جائے گی۔'
                : 'Note: This opening balance will be recorded as initial amount payable to this mill.'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'اضافی نوٹس / ٹرانسپورٹ تفصیل' : 'Notes / Transport Details'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={isUr ? 'مثلاً کائنات سٹیم چاول شہزاد گڈز کے ذریعے بھیجتے ہیں۔' : 'e.g. Dispatches 1121 steam via Shahzad Goods transport'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
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
              <Building2 className="w-4 h-4" />
              <span>{isUr ? 'کھاتہ محفوظ کریں' : 'Save Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
