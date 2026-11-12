import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, X, Mail, Key, Edit3, Trash2 } from 'lucide-react';
import { AddUserModal, type TerminalUser } from '../components/users/AddUserModal';
import { EditUserModal } from '../components/users/EditUserModal';
import { ResetPasswordModal } from '../components/users/ResetPasswordModal';
import { notifySuccess, notifyInfo } from '../utils/toast';
import { usePos } from '../context/PosContext';

export const UserManagementScreen: React.FC = () => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [users, setUsers] = useState<TerminalUser[]>([
    {
      id: 'usr-1',
      name: 'Syed S. Bukhari',
      urduName: 'سید بخاری',
      email: 's.bukhari@bukharirice.com',
      role: 'Cashier',
      terminal: 'Terminal #01 (Counter 01)',
      shift: 'Shift A (Morning 08:00 - 16:00)',
      status: 'Active',
      phone: '0300-8452199'
    },
    {
      id: 'usr-2',
      name: 'Haji M. Bilal Bukhari',
      urduName: 'حاجی بلال بخاری',
      email: 'bilal.bukhari@bukharirice.com',
      role: 'Admin',
      terminal: 'All Workstations (Admin Pass)',
      shift: 'Full Day In-Charge',
      status: 'Active',
      phone: '0301-4421882'
    },
    {
      id: 'usr-3',
      name: 'Muhammad Hamza',
      urduName: 'محمد حمزہ',
      email: 'm.hamza@bukharirice.com',
      role: 'Cashier',
      terminal: 'Terminal #02 (Wholesale Counter)',
      shift: 'Shift B (Evening 16:00 - 23:00)',
      status: 'Active',
      phone: '0321-9988112'
    },
    {
      id: 'usr-4',
      name: 'Munshi Bashir Ahmad',
      urduName: 'منشی بشیر احمد',
      email: 'munshi.bashir@bukharirice.com',
      role: 'Cashier',
      terminal: 'Godown Scale Platform #01',
      shift: 'Mandi Arrival Shift',
      status: 'Active',
      phone: '0345-7766554'
    }
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<TerminalUser | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<TerminalUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<TerminalUser | null>(null);

  const handleAddUser = (newUser: TerminalUser) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: TerminalUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    setUserToDelete(null);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)));
  };

  const handleSavePassword = (userId: string, newPassword: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {isUr ? 'صارفین اور رسائی کنٹرول' : 'User Management & Access Control'}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isUr
              ? 'کیشئرز کے لاگ ان، اجازت نامے اور پاس ورڈز کا انتظام کریں۔'
              : 'Manage cashier logins, role-based access permissions, and account passwords.'}
          </p>
        </div>

        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isUr ? '+ نیا صارف شامل کریں' : '+ Add New User'}</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">{isUr ? 'صارف کا نام' : 'USER NAME'}</th>
              <th className="py-2.5 px-3">{isUr ? 'لاگ ان ای میل' : 'LOGIN EMAIL'}</th>
              <th className="py-2.5 px-3">{isUr ? 'عہدہ و اختیارات' : 'ROLE & PERMISSION'}</th>
              <th className="py-2.5 px-3">{isUr ? 'کاؤنٹر' : 'ASSIGNED WORKSTATION'}</th>
              <th className="py-2.5 px-3">{isUr ? 'موبائل نمبر' : 'PHONE NO'}</th>
              <th className="py-2.5 px-3 text-center">{isUr ? 'حالت' : 'STATUS'}</th>
              <th className="py-2.5 px-3 text-center">{isUr ? 'عمل' : 'ACTION'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                {/* User Name */}
                <td className="py-3 px-4 font-sans">
                  <span className="font-bold text-slate-900 block text-xs">
                    {isUr ? (u.urduName || u.name) : u.name}
                  </span>
                </td>

                {/* Email */}
                <td className="py-3 px-3 font-mono text-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">{u.email}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    {isUr ? (u.role === 'Admin' ? 'ایڈمن' : 'کیشیئر') : u.role}
                  </span>
                </td>

                {/* Workstation */}
                <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                  {u.terminal}
                </td>

                {/* Phone */}
                <td className="py-3 px-3 font-mono text-slate-700">
                  {u.phone || '-'}
                </td>

                {/* Status Toggle */}
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    title="Click to toggle Active / Inactive"
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      u.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {u.status === 'Active' ? <Check className="w-2.5 h-2.5 mr-1" /> : <X className="w-2.5 h-2.5 mr-1" />}
                    {u.status}
                  </button>
                </td>

                {/* Actions: Edit, Password, Delete */}
                <td className="py-3 px-3 text-center font-sans">
                  <div className="flex items-center justify-center space-x-1.5">
                    {/* Edit User Button */}
                    <button
                      onClick={() => setSelectedUserForEdit(u)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                      title={isUr ? 'صارف ایڈٹ کریں' : 'Edit User Details'}
                    >
                      <Edit3 className="w-3 h-3 text-emerald-700" />
                      <span>{isUr ? 'ایڈٹ' : 'Edit'}</span>
                    </button>

                    {/* Reset Password Button */}
                    <button 
                      onClick={() => setSelectedUserForPassword(u)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                      title={isUr ? 'پاس ورڈ تبدیل کریں' : 'Reset Password'}
                    >
                      <Key className="w-3 h-3 text-slate-500" />
                      <span>{isUr ? 'پاس ورڈ' : 'Password'}</span>
                    </button>

                    {/* Delete User Button */}
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="inline-flex items-center p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 cursor-pointer transition-colors shadow-2xs"
                      title={isUr ? 'صارف ڈیلیٹ کریں' : 'Delete User'}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* Dedicated Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!selectedUserForPassword}
        user={selectedUserForPassword}
        onClose={() => setSelectedUserForPassword(null)}
        onSave={handleSavePassword}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!selectedUserForEdit}
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Standalone Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 text-xs text-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isUr ? 'صارف حذف کرنے کی تصدیق' : 'Confirm User Deletion'}
              </h3>
            </div>

            <p className="text-slate-600 text-xs">
              {isUr
                ? `کیا آپ واقعی صارف "${userToDelete.urduName || userToDelete.name}" (${userToDelete.email}) کو سسٹم سے مستقل حذف کرنا چاہتے ہیں؟`
                : `Are you sure you want to permanently delete user "${userToDelete.name}" (${userToDelete.email})?`}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
              >
                {isUr ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete.id)}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-xs transition-colors"
              >
                {isUr ? 'ہاں، صارف حذف کریں' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
