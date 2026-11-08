import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import type { TerminalUser } from './AddUserModal';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TerminalUser | null;
  onSave: (userId: string, newPassword: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      notifyWarning('Password must be at least 4 characters long (کم از کم 4 ہندسے یا حروف)');
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyWarning('Passwords do not match (پاس ورڈ یکساں نہیں ہیں)');
      return;
    }

    onSave(user.id, newPassword);
    notifySuccess(`Password updated successfully for ${user.name}! (پاس ورڈ کامیابی سے تبدیل ہو گیا)`);
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-300" />
            <h3 className="font-extrabold text-sm tracking-tight">
              Reset Password (پاس ورڈ تبدیل کریں)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-emerald-900/50 p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
              <span className="urdu-text text-emerald-800 font-semibold" dir="rtl">
                {user.urduName}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] mt-0.5 font-mono">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {user.role}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* New Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              New Password (نیا پاس ورڈ):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full font-mono text-xs border border-slate-300 rounded-lg px-3 py-2 pr-9 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Confirm Password (پاس ورڈ کی تصدیق):
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full font-mono text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              The cashier/supervisor will use their email (<strong>{user.email}</strong>) and this new password for workstation login and terminal unlocking.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancel (منسوخ)
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              Update Password (پاس ورڈ محفوظ کریں)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
