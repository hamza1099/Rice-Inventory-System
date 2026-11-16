import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Check, X, Mail, Key, Edit3, Trash2 } from 'lucide-react';
import { AddUserModal, type TerminalUser } from '../components/users/AddUserModal';
import { EditUserModal } from '../components/users/EditUserModal';
import { ResetPasswordModal } from '../components/users/ResetPasswordModal';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { notifySuccess, notifyInfo, notifyError } from '../utils/toast';
import { usePos } from '../context/PosContext';
import { registerFirebaseUser } from '../service/firebaseClient';
import {
  subscribeToUsers,
  addUserDoc,
  updateUserDoc,
  deleteUserDoc,
  updateUserPasswordDoc
} from '../service/firestoreService';

export const UserManagementScreen: React.FC = () => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [users, setUsers] = useState<TerminalUser[]>([]);

  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<TerminalUser | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<TerminalUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<TerminalUser | null>(null);

  useEffect(() => {
    const unsub = subscribeToUsers((firestoreUsers) => {
      setUsers(firestoreUsers || []);
    });
    return () => unsub();
  }, []);

  const handleAddUser = async (newUser: TerminalUser) => {
    let finalUser = { ...newUser };
    if (newUser.password) {
      try {
        const uid = await registerFirebaseUser(newUser.email, newUser.password);
        finalUser.id = uid;
      } catch (err: any) {
        console.warn('Firebase Auth user registration note:', err?.message);
      }
    }
    setUsers((prev) => [...prev, finalUser]);
    await addUserDoc(finalUser).catch(console.error);
  };

  const handleUpdateUser = async (updatedUser: TerminalUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    await updateUserDoc(updatedUser.id, updatedUser).catch(console.error);
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setUserToDelete(null);
    await deleteUserDoc(userId).catch(console.error);
  };

  const handleToggleStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
    await updateUserDoc(id, { status: newStatus }).catch(console.error);
  };

  const handleSavePassword = async (userId: string, newPassword: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
    await updateUserPasswordDoc(userId, newPassword).catch(console.error);
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
        {users.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">
              {isUr ? 'کوئی صارف موجود نہیں ہے' : 'No System Users Found'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              {isUr
                ? 'اوپر دیئے گئے "+ نیا صارف شامل کریں" بٹن سے یا Firebase Console سے صارف شامل کریں۔'
                : 'Click "+ Add New User" above or add users via Firebase Authentication Console to manage access.'}
            </p>
          </div>
        ) : (
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
        )}
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
      <ConfirmDeleteModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            handleDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        title={isUr ? 'صارف حذف کرنے کی تصدیق' : 'Confirm User Deletion'}
        description={
          isUr
            ? `کیا آپ واقعی صارف "${userToDelete?.urduName || userToDelete?.name}" (${userToDelete?.email}) کو سسٹم سے مستقل حذف کرنا چاہتے ہیں؟ اس کا تمام رسائی ریکارڈ ختم ہو جائے گا۔`
            : `Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? All permissions and access for this user will be revoked.`
        }
        itemName={userToDelete ? `${userToDelete.name} (${userToDelete.role})` : ''}
        itemType={isUr ? 'صارف کا نام:' : 'User:'}
        confirmText={isUr ? 'ہاں، صارف حذف کریں' : 'Yes, Delete User'}
      />
    </div>
  );
};
