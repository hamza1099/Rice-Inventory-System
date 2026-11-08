import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';

export interface TerminalUser {
  id: string;
  name: string;
  urduName: string;
  email: string;
  role: 'Cashier' | 'Supervisor' | 'Admin' | 'Munshi';
  terminal: string;
  shift: string;
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
  const [name, setName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [isUrduManuallyEdited, setIsUrduManuallyEdited] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'Cashier' | 'Supervisor' | 'Admin' | 'Munshi'>('Cashier');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [terminal, setTerminal] = useState<string>('Terminal #01 (Counter 01)');
  const [shift, setShift] = useState<string>('Shift A (Morning 08:00 - 16:00)');
  const [phone, setPhone] = useState<string>('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isUrduManuallyEdited || !urduName.trim()) {
      const autoUrdu = transliterateEnglishToUrduName(val);
      setUrduName(autoUrdu);
    }
  };

  const handleUrduNameChange = (val: string) => {
    setUrduName(val);
    setIsUrduManuallyEdited(val.trim().length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter user name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      alert('Please enter a password (at least 4 characters).');
      return;
    }

    const newUser: TerminalUser = {
      id: `usr-${Date.now()}`,
      name,
      urduName: urduName || transliterateEnglishToUrduName(name) || name,
      email: email.trim().toLowerCase(),
      role,
      terminal,
      shift,
      password,
      status: 'Active',
      phone: phone || '0300-0000000'
    };

    onAddUser(newUser);
    // Reset fields
    setName('');
    setUrduName('');
    setIsUrduManuallyEdited(false);
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Add New Terminal User</h3>
              <p className="urdu-text text-[11px] text-emerald-100" dir="rtl">
                نیا صارف شامل کریں (ای میل، عہدہ اور پاس ورڈ)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* User Full Name & Urdu Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Name (انگریزی نام):
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Asif Ali"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Urdu Name (اردو نام):
                </label>
                {name && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrduName(transliterateEnglishToUrduName(name));
                      setIsUrduManuallyEdited(false);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5"
                    title="خودکار ترجمہ کریں"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => handleUrduNameChange(e.target.value)}
                placeholder="خودکار اردو نام"
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden urdu-text text-sm font-medium"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Email Address (ای میل ایڈریس - برائے لاگ ان):</span>
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
                <span>Role (عہدہ / پرمیشن):</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
              >
                <option value="Cashier">Cashier (کاؤنٹر کیشیئر)</option>
                <option value="Supervisor">Supervisor (سپروائزر)</option>
                <option value="Munshi">Munshi (منشی گودام)</option>
                <option value="Admin">Admin (ایڈمن)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Password (پاس ورڈ):</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

          {/* Assigned Workstation & Shift Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Assigned Terminal:
              </label>
              <select
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
              >
                <option value="Terminal #01 (Counter 01)">Terminal #01 (Counter 01)</option>
                <option value="Terminal #02 (Wholesale Counter)">Terminal #02 (Wholesale Counter)</option>
                <option value="Godown Scale Platform #01">Godown Scale Platform #01</option>
                <option value="All Workstations (Supervisor Pass)">All Workstations</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Shift Timing:
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
              >
                <option value="Shift A (Morning 08:00 - 16:00)">Shift A (Morning)</option>
                <option value="Shift B (Evening 16:00 - 23:00)">Shift B (Evening)</option>
                <option value="Full Day In-Charge">Full Day In-Charge</option>
              </select>
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Contact Phone (موبائل نمبر):
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-4 py-3 -mx-5 -mb-5 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Save User (صارف محفوظ کریں)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
