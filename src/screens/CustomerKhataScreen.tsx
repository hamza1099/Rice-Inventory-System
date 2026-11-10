import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { StatCard } from '../components/common/StatCard';
import { AddCustomerModal } from '../components/khata/AddCustomerModal';
import { EditCustomerModal } from '../components/khata/EditCustomerModal';
import { AddKhataPurchaseModal } from '../components/khata/AddKhataPurchaseModal';
import { ReceivePaymentModal } from '../components/khata/ReceivePaymentModal';
import { KhataStatementPrintModal } from '../components/khata/KhataStatementPrintModal';
import { notifySuccess, notifyInfo, notifyWarning } from '../utils/toast';
import type { KhataCustomer, KhataTransaction } from '../types';
import {
  BookOpen,
  UserPlus,
  Search,
  Phone,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Share2,
  Edit,
  Trash2,
  Clock,
  Wallet,
  Building2,
  Coins,
  ShieldCheck,
  Send
} from 'lucide-react';

export const CustomerKhataScreen: React.FC = () => {
  const {
    khataCustomers,
    khataTransactions,
    selectedKhataCustomerId,
    setSelectedKhataCustomerId,
    deleteKhataTransaction,
  } = usePos();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState<boolean>(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState<boolean>(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState<boolean>(false);
  const [isStatementPrintOpen, setIsStatementPrintOpen] = useState<boolean>(false);

  // Active selected customer
  const selectedCustomer = useMemo(() => {
    if (!selectedKhataCustomerId) return khataCustomers[0] || null;
    return khataCustomers.find((c) => c.id === selectedKhataCustomerId) || khataCustomers[0] || null;
  }, [khataCustomers, selectedKhataCustomerId]);

  // Customer transactions sorted chronologically (newest first for UI table)
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return khataTransactions
      .filter((tx) => tx.customerId === selectedCustomer.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [khataTransactions, selectedCustomer]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return khataCustomers.filter((c) => {
      // Filter by status
      if (filterStatus === 'PENDING' && c.currentBalance <= 0) return false;
      if (filterStatus === 'SETTLED' && c.currentBalance > 0) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.customerName.toLowerCase().includes(q);
        const matchShop = c.shopName.toLowerCase().includes(q);
        const matchUrdu = c.urduName ? c.urduName.toLowerCase().includes(q) : false;
        const matchPhone = c.phone.includes(q);
        const matchAddress = c.address.toLowerCase().includes(q);
        return matchName || matchShop || matchUrdu || matchPhone || matchAddress;
      }

      return true;
    });
  }, [khataCustomers, filterStatus, searchQuery]);

  // High-level aggregates
  const totalMarketUdhar = useMemo(() => {
    return khataCustomers.reduce((sum, c) => sum + c.currentBalance, 0);
  }, [khataCustomers]);

  const activeKhateCount = useMemo(() => {
    return khataCustomers.filter((c) => c.currentBalance > 0).length;
  }, [khataCustomers]);

  const settledKhateCount = useMemo(() => {
    return khataCustomers.filter((c) => c.currentBalance <= 0).length;
  }, [khataCustomers]);

  const totalRecoveredThisMonth = useMemo(() => {
    return khataTransactions
      .filter((tx) => tx.type === 'PAYMENT')
      .reduce((sum, tx) => sum + tx.credit, 0);
  }, [khataTransactions]);

  // WhatsApp Reminder Handler
  const handleSendWhatsAppReminder = (customer: KhataCustomer) => {
    if (!customer.phone) {
      notifyWarning('گاہک کا فون نمبر موجود نہیں ہے۔');
      return;
    }

    // Clean phone number: remove dashes, spaces, leading 0 to international format
    let cleanPhone = customer.phone.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('92')) {
      cleanPhone = '92' + cleanPhone;
    }

    const message = `محترم ${customer.customerName} صاحب (${customer.shopName})،\n\nبخاری رائس ٹریڈرز غلہ منڈی اوکاڑہ کے ریکارڈ کے مطابق آپ کے کھاتے کا بقیہ واجب الادا بیلنس PKR ${customer.currentBalance.toLocaleString()} ہے۔\n\nبرائے مہربانی اپنا کھاتہ جلد از جلد بیباق فرما کر رسید حاصل کریں۔ شکریہ!\n\nبخاری رائس ٹریڈرز - فون: 0300-7589211`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    notifySuccess('WhatsApp Reminder ونڈو اوپن ہو گئی ہے۔');
  };

  // Delete transaction with confirmation
  const handleDeleteTx = (txId: string, desc: string) => {
    if (window.confirm(`کیا آپ واقعی اس ٹرانزیکشن کو ڈیلیٹ کرنا چاہتے ہیں؟\n"${desc}"\nاس سے بقایا بیلنس دوبارہ درست ہو جائے گا۔`)) {
      deleteKhataTransaction(txId);
      notifyInfo('ٹرانزیکشن ڈیلیٹ ہو گئی اور بیلنس ایڈجسٹ ہو گیا۔');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Stats Strip */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Udhar Khata Book (ادھار کھاتہ بک)
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  Mandi Ledger • غلہ آڑھت
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent Customer Credit Accounts, Date-wise Dispatches & Partial Payment Recoveries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ New Khata (نیا کھاتہ کھولیں)</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Total Market Receivables"
            urduTitle="مارکیٹ بقایا"
            value={`PKR ${totalMarketUdhar.toLocaleString()}`}
            subValue={`${activeKhateCount} دکانوں سے وصولی باقی`}
            icon={Coins}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            badge={totalMarketUdhar > 0 ? 'واجب الادا' : 'مکمل وصول'}
            badgeColor={totalMarketUdhar > 0 ? 'red' : 'emerald'}
          />

          <StatCard
            title="Active Khate"
            urduTitle="زیر التواء کھاتے"
            value={`${activeKhateCount} Accounts`}
            subValue="جن کا بقایا 0 سے زیادہ ہے"
            icon={Building2}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            badge={`${khataCustomers.length} Total`}
            badgeColor="amber"
          />

          <StatCard
            title="Total Recoveries"
            urduTitle="کل وصول شدہ"
            value={`PKR ${totalRecoveredThisMonth.toLocaleString()}`}
            subValue="نقد و راست پیمنٹس موصول"
            icon={Wallet}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            badge="کامیاب وصولی"
            badgeColor="emerald"
          />

          <StatCard
            title="Settled Accounts"
            urduTitle="مکمل بیباق"
            value={`${settledKhateCount} Accounts`}
            subValue="جن کا ادھار 100% بیباق ہو چکا"
            icon={ShieldCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            badge="Zero Balance"
            badgeColor="blue"
          />
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column: Customers List */}
        <div className="w-full md:w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-shrink-0">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shop, name, phone (دکان یا فون نمبر)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`py-1 rounded-lg transition-all ${
                  filterStatus === 'ALL'
                    ? 'bg-white text-emerald-950 font-bold shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({khataCustomers.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`py-1 rounded-lg transition-all ${
                  filterStatus === 'PENDING'
                    ? 'bg-white text-rose-700 font-bold shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Pending ({activeKhateCount})
              </button>
              <button
                onClick={() => setFilterStatus('SETTLED')}
                className={`py-1 rounded-lg transition-all ${
                  filterStatus === 'SETTLED'
                    ? 'bg-white text-emerald-800 font-bold shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Settled ({settledKhateCount})
              </button>
            </div>
          </div>

          {/* Customer Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredCustomers.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">کوئی کھاتہ نہیں ملا</p>
                <p className="text-xs text-slate-400 mt-1">
                  نئے گاہک کا کھاتہ کھولنے کے لیے اوپر بٹن دبائیں۔
                </p>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  + Add Customer
                </button>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const hasPending = cust.currentBalance > 0;
                const creditLimit = cust.creditLimit || 0;
                const limitUtilization =
                  creditLimit > 0
                    ? Math.min(100, Math.round((cust.currentBalance / creditLimit) * 100))
                    : 0;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedKhataCustomerId(cust.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {cust.shopName}
                          </p>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 animate-pulse"></span>
                          )}
                        </div>
                        {cust.urduName && (
                          <p className="text-xs font-medium text-emerald-800 font-urdu truncate">
                            {cust.urduName}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {cust.customerName} • {cust.phone}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-black ${
                            hasPending ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          PKR {cust.currentBalance.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                            hasPending
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {hasPending ? 'بقیہ واجب الادا' : 'بیباق / Settled'}
                        </span>
                      </div>
                    </div>

                    {/* Limit progress bar */}
                    {creditLimit > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Limit: PKR {creditLimit.toLocaleString()}</span>
                        <span
                          className={`font-semibold ${
                            limitUtilization > 85 ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {limitUtilization}% used
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Customer Ledger & Full Breakdown */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {selectedCustomer ? (
            <>
              {/* Selected Customer Header Banner */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-emerald-950 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded text-[11px] font-bold uppercase">
                        Khata #{selectedCustomer.id}
                      </span>
                      <h2 className="text-xl font-black tracking-tight">{selectedCustomer.shopName}</h2>
                      {selectedCustomer.urduName && (
                        <span className="text-base font-bold text-emerald-300 font-urdu">
                          ({selectedCustomer.urduName})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span>
                        Proprietor: <strong className="text-white">{selectedCustomer.customerName}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedCustomer.phone}
                      </span>
                      {selectedCustomer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedCustomer.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prominent Balance Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 flex items-center gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                        Current Outstanding Balance / بقیہ رقم
                      </p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-white">
                          PKR {selectedCustomer.currentBalance.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            selectedCustomer.currentBalance > 0
                              ? 'bg-rose-500/80 text-white'
                              : 'bg-emerald-500/80 text-white'
                          }`}
                        >
                          {selectedCustomer.currentBalance > 0 ? 'واجب الادا' : 'مکمل بیباق'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Add Udhar Purchase Button */}
                    <button
                      onClick={() => setIsAddPurchaseOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-950" />
                      <span>+ Udhar Purchase (ادھار مال دیں)</span>
                    </button>

                    {/* Receive Payment Button */}
                    <button
                      onClick={() => setIsReceivePaymentOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow transition-all"
                    >
                      <ArrowDownLeft className="w-4 h-4 text-white" />
                      <span>+ Receive Payment (رقم وصول کریں)</span>
                    </button>

                    {/* WhatsApp Reminder Button */}
                    <button
                      onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white font-semibold rounded-xl text-xs border border-emerald-500/40 transition-all"
                      title="گاہک کو واٹس ایپ پر بقایا کا میسج بھیجیں"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Print Statement Button */}
                    <button
                      onClick={() => setIsStatementPrintOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Statement (پرچی)</span>
                    </button>

                    {/* Edit Customer Button */}
                    <button
                      onClick={() => setIsEditCustomerOpen(true)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs border border-white/20 transition-all"
                      title="Edit Customer Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ledger Table Container */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Date-wise Itemized Ledger (روزنامچہ کھاتہ نقل)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chronological history of purchases, grain dispatches, and cash/raast payments
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Total Transactions: <span className="text-slate-800 font-bold">{customerTransactions.length}</span>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5 w-32">Date & Time</th>
                        <th className="py-3 px-3 w-28">Type (نوعیت)</th>
                        <th className="py-3 px-3">Description & Items (تفصیل خریداری / ادائیگی)</th>
                        <th className="py-3 px-3 text-right w-28">Debit (+) بنام</th>
                        <th className="py-3 px-3 text-right w-28">Credit (-) جمع</th>
                        <th className="py-3 px-3 text-right w-32">Balance (بقایا)</th>
                        <th className="py-3 px-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-medium text-slate-600">No transactions recorded yet</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Add a credit purchase or payment recovery using the buttons above.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        customerTransactions.map((tx) => {
                          const isPurchase = tx.type === 'PURCHASE';
                          const isPayment = tx.type === 'PAYMENT';
                          const isOpening = tx.type === 'OPENING_BALANCE';

                          return (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                              {/* Date & Time */}
                              <td className="py-3 px-3.5 align-top whitespace-nowrap">
                                <span className="font-semibold text-slate-800">
                                  {tx.dateStr}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {tx.timeStr}
                                </div>
                              </td>

                              {/* Transaction Type Badge */}
                              <td className="py-3 px-3 align-top whitespace-nowrap">
                                {isPurchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    <ArrowUpRight className="w-3 h-3 text-amber-700" />
                                    ادھار خریداری
                                  </span>
                                )}
                                {isPayment && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                                    وصولی رقم
                                  </span>
                                )}
                                {isOpening && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                    سابقہ بقایا
                                  </span>
                                )}
                              </td>

                              {/* Description & Itemized entries */}
                              <td className="py-3 px-3 align-top">
                                <div className="font-semibold text-slate-800">
                                  {tx.description}
                                </div>

                                {/* Items Breakdown */}
                                {tx.items && tx.items.length > 0 && (
                                  <div className="mt-1.5 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                    {tx.items.map((it, idx) => (
                                      <div
                                        key={idx}
                                        className="text-[11px] text-slate-600 flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                          <span className="font-medium text-slate-800">{it.productName}</span>
                                          <span className="text-slate-400">
                                            ({it.quantity} {it.unit} × Rs. {it.rate})
                                          </span>
                                        </div>
                                        <span className="font-bold text-slate-800">
                                          PKR {it.subtotal.toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Payment Mode & Reference */}
                                {isPayment && (
                                  <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-bold">
                                      {tx.paymentMode || 'CASH'}
                                    </span>
                                    {tx.referenceNo && (
                                      <span className="text-slate-500">Ref: {tx.referenceNo}</span>
                                    )}
                                  </div>
                                )}

                                {tx.notes && (
                                  <div className="text-[10px] text-slate-400 italic mt-0.5">
                                    Note: {tx.notes}
                                  </div>
                                )}
                              </td>

                              {/* Debit (+) */}
                              <td className="py-3 px-3 align-top text-right whitespace-nowrap font-bold text-amber-900">
                                {tx.debit > 0 ? `PKR ${tx.debit.toLocaleString()}` : '-'}
                              </td>

                              {/* Credit (-) */}
                              <td className="py-3 px-3 align-top text-right whitespace-nowrap font-bold text-emerald-700">
                                {tx.credit > 0 ? `PKR ${tx.credit.toLocaleString()}` : '-'}
                              </td>

                              {/* Running Balance */}
                              <td className="py-3 px-3 align-top text-right whitespace-nowrap font-black text-slate-900">
                                PKR {tx.balanceAfter.toLocaleString()}
                              </td>

                              {/* Action: Delete */}
                              <td className="py-3 px-2 align-top text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteTx(tx.id, tx.description)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete this transaction entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500">Total Purchases (بنام): </span>
                    <strong className="text-amber-900 font-bold">
                      PKR {selectedCustomer.totalDebit.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Payments (جمع): </span>
                    <strong className="text-emerald-800 font-bold">
                      PKR {selectedCustomer.totalCredit.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Current Balance (بقیہ): </span>
                    <strong className="text-slate-900 font-black text-sm">
                      PKR {selectedCustomer.currentBalance.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStatementPrintOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Parchi (پرچی)</span>
                  </button>
                  <button
                    onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Balance</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No Khata Selected</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Please select a customer from the left list to view their ledger, record new purchases, or collect payments.
              </p>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow"
              >
                + Open First Khata (نیا کھاتہ کھولیں)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        customer={selectedCustomer}
        onClose={() => setIsEditCustomerOpen(false)}
      />

      <AddKhataPurchaseModal
        isOpen={isAddPurchaseOpen}
        customer={selectedCustomer}
        onClose={() => setIsAddPurchaseOpen(false)}
      />

      <ReceivePaymentModal
        isOpen={isReceivePaymentOpen}
        customer={selectedCustomer}
        onClose={() => setIsReceivePaymentOpen(false)}
      />

      {selectedCustomer && (
        <KhataStatementPrintModal
          isOpen={isStatementPrintOpen}
          customer={selectedCustomer}
          transactions={customerTransactions}
          onClose={() => setIsStatementPrintOpen(false)}
        />
      )}
    </div>
  );
};
