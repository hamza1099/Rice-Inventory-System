import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, X, KeyRound } from 'lucide-react';
import { AddUserModal } from '../components/users/AddUserModal';

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

export const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<TerminalUser[]>([
    {
      id: 'usr-1',
      name: 'Syed S. Bukhari',
      urduName: 'سید بخاری',
      role: 'Cashier',
      terminal: 'Terminal #01 (Counter 01)',
      shift: 'Shift A (Morning 08:00 - 16:00)',
      pin: '••••',
      status: 'Active',
      phone: '0300-8452199'
    },
    {
      id: 'usr-2',
      name: 'Haji M. Bilal Bukhari',
      urduName: 'حاجی بلال بخاری',
      role: 'Supervisor',
      terminal: 'All Workstations (Supervisor Pass)',
      shift: 'Full Day In-Charge',
      pin: '9921',
      status: 'Active',
      phone: '0301-4421882'
    },
    {
      id: 'usr-3',
      name: 'Muhammad Hamza',
      urduName: 'محمد حمزہ',
      role: 'Cashier',
      terminal: 'Terminal #02 (Wholesale Counter)',
      shift: 'Shift B (Evening 16:00 - 23:00)',
      pin: '••••',
      status: 'Active',
      phone: '0321-9988112'
    },
    {
      id: 'usr-4',
      name: 'Munshi Bashir Ahmad',
      urduName: 'منشی بشیر احمد',
      role: 'Munshi',
      terminal: 'Godown Scale Platform #01',
      shift: 'Mandi Arrival Shift',
      pin: '••••',
      status: 'Active',
      phone: '0345-7766554'
    }
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);

  const handleAddUser = (newUser: TerminalUser) => {
    setUsers([...users, newUser]);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const handleResetPin = (name: string) => {
    const newPin = prompt(`Enter new 4-digit PIN for ${name}:`, '1234');
    if (newPin) {
      alert(`PIN for ${name} has been updated to: ${newPin}`);
    }
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              User Management & Terminal Access
            </h2>
            <span className="urdu-text text-sm text-emerald-800 font-bold" dir="rtl">
              (صارفین اور کاؤنٹر کیشیئر لسٹ)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage cashier logins, supervisor authorization PIN codes, and terminal assignment roles.
          </p>
        </div>

        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New User (نیا صارف)</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">USER NAME</th>
              <th className="py-2.5 px-3">ROLE & PERMISSION</th>
              <th className="py-2.5 px-3">ASSIGNED WORKSTATION</th>
              <th className="py-2.5 px-3">SHIFT TIMING</th>
              <th className="py-2.5 px-3">PHONE / CONTACT</th>
              <th className="py-2.5 px-3 text-center">STATUS</th>
              <th className="py-2.5 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-sans">
                  <span className="font-bold text-slate-900 block text-xs">{u.name}</span>
                  <span className="urdu-text text-[11px] text-emerald-900 font-semibold" dir="rtl">
                    {u.urduName}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'Supervisor'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : u.role === 'Admin'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    {u.role}
                  </span>
                </td>

                <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                  {u.terminal}
                </td>

                <td className="py-3 px-3 font-sans text-slate-600">
                  {u.shift}
                </td>

                <td className="py-3 px-3 text-slate-700">
                  {u.phone}
                </td>

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

                <td className="py-3 px-3 text-center font-sans">
                  <button 
                    onClick={() => handleResetPin(u.name)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 cursor-pointer transition-colors"
                  >
                    Reset PIN
                  </button>
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
    </div>
  );
};
