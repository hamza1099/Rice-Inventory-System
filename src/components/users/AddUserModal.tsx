import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';

interface TerminalUser {
  id: string;
  name: string;
  urduName: string;
  role: 'Cashier' | 'Supervisor' | 'Admin' | 'Munshi';
  terminal: string;
  shift: string;
  pin: string;
  status: 'Active' | 'Inactive';
  phone: string;
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
  const [role, setRole] = useState<'Cashier' | 'Supervisor' | 'Admin' | 'Munshi'>('Cashier');
  const [terminal, setTerminal] = useState<string>('Terminal #01 (Counter 01)');
  const [shift, setShift] = useState<string>('Shift A (Morning 08:00 - 16:00)');
  const [pin, setPin] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter user name.');
      return;
    }

    const newUser: TerminalUser = {
      id: `usr-${Date.now()}`,
      name,
      urduName: urduName || name,
      role,
      terminal,
      shift,
      pin: pin ? '••••' : '••••',
      status: 'Active',
      phone: phone || '0300-0000000'
    };

    onAddUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Add New Terminal User</h3>
              <p className="urdu-text text-[11px] text-emerald-100" dir="rtl">
                نیا کاؤنٹر کیشیئر یا سپروائزر شامل کریں
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Name (انگریزی نام):
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asif Ali"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Urdu Name (اردو نام):
              </label>
              <input
                type="text"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder="آصف علی"
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden urdu-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Role & Permissions:
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
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                4-Digit Security PIN:
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono tracking-widest text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Assigned Workstation:
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
              <span>Save User (محفوظ کریں)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
