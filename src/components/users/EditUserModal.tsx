import React, { useState, useEffect } from 'react';
import { X, Edit3, Mail, Shield, Sparkles, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { usePos } from '../../context/PosContext';
import type { TerminalUser } from './AddUserModal';

interface EditUserModalProps {
  isOpen: boolean;
  user: TerminalUser | null;
  onClose: () => void;
  onUpdateUser: (user: TerminalUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onDeleteUser,
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [name, setName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [isUrduManuallyEdited, setIsUrduManuallyEdited] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'Admin' | 'Cashier'>('Cashier');
  const [terminal, setTerminal] = useState<string>('Terminal #01 (Counter 01)');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUrduName(user.urduName || '');
      setIsUrduManuallyEdited(Boolean(user.urduName));
      setEmail(user.email);
      setRole(user.role);
      setTerminal(user.terminal);
      setPhone(user.phone || '');
      setStatus(user.status);
      setShowDeleteConfirm(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

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
      if (name.trim()) {
        setUrduName(transliterateEnglishToUrduName(name));
      }
    } else {
      setIsUrduManuallyEdited(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifyWarning(isUr ? 'صارف کا نام درج کریں' : 'Please enter user name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      notifyWarning(isUr ? 'درست ای میل درج کریں' : 'Please enter a valid email address');
      return;
    }

    const updatedUser: TerminalUser = {
      ...user,
      name: name.trim(),
      urduName: urduName.trim() || transliterateEnglishToUrduName(name) || name.trim(),
      email: email.trim().toLowerCase(),
      role,
      terminal,
      phone: phone.trim() || undefined,
      status
    };

    onUpdateUser(updatedUser);
    notifySuccess(isUr ? `صارف ${name} اپڈیٹ ہو گیا!` : `User ${name} updated successfully!`);
    onClose();
  };

  const handleDelete = () => {
    onDeleteUser(user.id);
    notifySuccess(isUr ? `صارف ${user.name} حذف کر دیا گیا!` : `User ${user.name} deleted successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs my-4">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>{isUr ? 'صارف کی معلومات ایڈٹ کریں' : 'Edit User Details'}</span>
              </h2>
              <p className="text-[11px] text-emerald-100 font-sans">
                {user.email}
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

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex items-start space-x-3 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs">
                {isUr ? 'کیا آپ واقعی اس صارف کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this user?'}
              </p>
              <p className="text-[11px] text-red-700 mt-0.5">
                {user.name} ({user.email})
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs cursor-pointer shadow-xs transition-colors"
                >
                  {isUr ? 'ہاں، صارف حذف کریں' : 'Yes, Delete User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded border border-slate-300 text-xs cursor-pointer transition-colors"
                >
                  {isUr ? 'منسوخ' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* User Full Name & Urdu Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'انگریزی نام:' : 'Full Name:'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isUr ? 'مثلاً Asif Ali' : 'e.g. Asif Ali'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span>{isUr ? 'اردو نام:' : 'Urdu Name:'}</span>
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
                      setUrduName(transliterateEnglishToUrduName(name));
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5 underline"
                    title={isUr ? 'دوبارہ خودکار کریں' : 'Reset to Auto'}
                  >
                    <span>{isUr ? 'خودکار ری سیٹ' : 'Reset to Auto'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => handleUrduNameChange(e.target.value)}
                placeholder={isUr ? 'انگریزی نام سے خودکار اردو بنے گی...' : 'Auto-generated from Full Name...'}
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUr ? 'ای میل ایڈریس:' : 'Email Address:'}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@bukharirice.com"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono"
            />
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'عہدہ / پرمیشن:' : 'Role / Permission:'}</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Cashier')}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
              >
                <option value="Cashier">{isUr ? 'کیشیئر' : 'Cashier'}</option>
                <option value="Admin">{isUr ? 'ایڈمن' : 'Admin'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'اکاؤنٹ اسٹیٹس:' : 'Account Status:'}</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
              >
                <option value="Active">{isUr ? 'فعال (Active)' : 'Active'}</option>
                <option value="Inactive">{isUr ? 'غیر فعال (Inactive)' : 'Inactive'}</option>
              </select>
            </div>
          </div>

          {/* Assigned Workstation & Contact Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'متعلقہ ٹرمینل:' : 'Assigned Terminal:'}
              </label>
              <select
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
              >
                <option value="Terminal #01 (Counter 01)">{isUr ? 'ٹرمینل #01 (کاؤنٹر 01)' : 'Terminal #01 (Counter 01)'}</option>
                <option value="Terminal #02 (Wholesale Counter)">{isUr ? 'ٹرمینل #02 (تھوک کاؤنٹر)' : 'Terminal #02 (Wholesale Counter)'}</option>
                <option value="Godown Scale Platform #01">{isUr ? 'گودام کانٹا پلیٹ فارم #01' : 'Godown Scale Platform #01'}</option>
                <option value="All Workstations (Admin Pass)">{isUr ? 'تمام ورک سٹیشنز' : 'All Workstations'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'موبائل نمبر:' : 'Contact Phone:'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-4 py-3 -mx-5 -mb-5 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isUr ? 'صارف ڈیلیٹ کریں' : 'Delete User'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
              >
                {isUr ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer shadow-xs transition-colors"
              >
                {isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
