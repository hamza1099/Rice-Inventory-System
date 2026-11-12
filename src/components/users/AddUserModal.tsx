import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { usePos } from '../../context/PosContext';

export interface TerminalUser {
  id: string;
  name: string;
  urduName: string;
  email: string;
  role: 'Admin' | 'Cashier';
  terminal: string;
  shift?: string;
  password?: string;
  status: 'Active' | 'Inactive';
  phone?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: TerminalUser) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [name, setName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [isUrduManuallyEdited, setIsUrduManuallyEdited] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'Admin' | 'Cashier'>('Cashier');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [terminal, setTerminal] = useState<string>('Terminal #01 (Counter 01)');
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUrduName('');
      setIsUrduManuallyEdited(false);
      setEmail('');
      setPassword('');
      setPhone('');
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
    if (!password || password.length < 4) {
      notifyWarning(isUr ? 'پاس ورڈ کم از کم 4 ہندسے ہونا چاہیے' : 'Please enter a password (at least 4 characters)');
      return;
    }

    const newUser: TerminalUser = {
      id: `usr-${Date.now()}`,
      name,
      urduName: urduName || transliterateEnglishToUrduName(name) || name,
      email: email.trim().toLowerCase(),
      role,
      terminal,
      password,
      status: 'Active',
      phone: phone.trim() || undefined
    };

    onAddUser(newUser);
    notifySuccess(isUr ? `صارف ${name} شامل کر دیا گیا!` : `User ${name} added successfully!`);
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
                <span>{isUr ? 'نیا سسٹم صارف شامل کریں' : 'Add New System User'}</span>
              </h2>
              <p className="text-[11px] text-emerald-100 font-sans">
                {isUr ? 'کاؤنٹر کیشیئر یا ایڈمن اکاؤنٹ' : 'Cashier or Admin Account'}
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
              placeholder="cashier@bukharirice.com"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono"
            />
          </div>

          {/* Role & Password */}
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
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'پاس ورڈ:' : 'Password:'}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isUr ? 'پاس ورڈ درج کریں' : 'Enter password'}
                  className="w-full px-2.5 py-1.5 pr-8 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
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
          <div className="bg-slate-50 px-4 py-3 -mx-5 -mb-5 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isUr ? 'صارف محفوظ کریں' : 'Save User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
