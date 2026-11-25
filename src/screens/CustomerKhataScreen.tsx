import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { StatCard } from '../components/common/StatCard';
import { AddCustomerModal } from '../components/khata/AddCustomerModal';
import { EditCustomerModal } from '../components/khata/EditCustomerModal';
import { AddKhataPurchaseModal } from '../components/khata/AddKhataPurchaseModal';
import { ReceivePaymentModal } from '../components/khata/ReceivePaymentModal';
import { KhataStatementPrintModal } from '../components/khata/KhataStatementPrintModal';
import { CustomerLedgerDetailModal } from '../components/khata/CustomerLedgerDetailModal';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { notifySuccess, notifyInfo, notifyWarning } from '../utils/toast';
import type { KhataCustomer } from '../types';
import {
  BookOpen,
  UserPlus,
  Search,
  Phone,
  MapPin,
  Wallet,
  Building2,
  Coins,
  ShieldCheck,
  Trash2,
  Copy
} from 'lucide-react';

export const CustomerKhataScreen: React.FC = () => {
  const {
    khataCustomers,
    isCustomersLoading,
    khataTransactions,
    selectedKhataCustomerId,
    setSelectedKhataCustomerId,
    deleteKhataCustomer,
    deleteKhataTransaction,
    language,
  } = usePos();

  const isUr = language === 'ur';
  const isInitialLoading = isCustomersLoading && khataCustomers.length === 0;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');

  // Modals state
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState<boolean>(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState<boolean>(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState<boolean>(false);
  const [isStatementPrintOpen, setIsStatementPrintOpen] = useState<boolean>(false);
  const [txToDelete, setTxToDelete] = useState<{ id: string; desc: string } | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<KhataCustomer | null>(null);

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
        const cleanQ = q.replace(/\D/g, '');
        const cleanCustPhone = c.phone.replace(/\D/g, '');
        const matchPhone = c.phone.includes(q) || (cleanQ.length >= 3 && cleanCustPhone.includes(cleanQ));
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
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.credit, 0);
  }, [khataTransactions]);

  // Send WhatsApp reminder
  const handleSendWhatsAppReminder = (customer: KhataCustomer) => {
    if (!customer.phone) {
      notifyWarning(isUr ? 'گاہک کا فون نمبر موجود نہیں ہے۔' : 'Customer phone number is missing.');
      return;
    }

    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('92')) {
      cleanPhone = '92' + cleanPhone;
    }

    const customerDisplayName = customer.customerName && customer.shopName
      ? `${customer.customerName} (${customer.shopName})`
      : (customer.customerName || customer.shopName || 'گاہک');

    const message = `محترم ${customerDisplayName}،\n\nبخاری رائس ٹریڈرز کے ریکارڈ کے مطابق، آپ کے ذمہ ${customer.currentBalance.toLocaleString()} روپے واجب الادا ہیں۔ براہِ کرم جلد از جلد اپنا حساب کلیئر کر دیں۔\n\nبخاری رائس ٹریڈرز - لین نمبر 9، لالہ رخ کالونی، چکری روڈ، بنی سٹاپ، راولپنڈی - فون: 0310-5612914`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    notifySuccess(isUr ? 'WhatsApp Reminder ونڈو اوپن ہو گئی ہے۔' : 'WhatsApp window opened.');
  };

  // Delete transaction with confirmation modal
  const handleDeleteTx = (txId: string, desc: string) => {
    setTxToDelete({ id: txId, desc });
  };

  // Delete customer with confirmation modal
  const handleConfirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    const name = customerToDelete.shopName || customerToDelete.customerName;
    deleteKhataCustomer(customerToDelete.id);
    notifySuccess(
      isUr
        ? `"${name}" کا کھاتہ کامیابی سے ڈیلیٹ کر دیا گیا`
        : `Customer "${name}" deleted successfully`
    );
    setCustomerToDelete(null);
    if (selectedCustomer?.id === customerToDelete.id) {
      setIsLedgerModalOpen(false);
    }
  };

  const handleOpenCustomerDetail = (customerId: string) => {
    setSelectedKhataCustomerId(customerId);
    setIsLedgerModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      {/* Top Stats Strip */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 shadow-xs shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {isUr ? 'ادھار کھاتہ رجسٹر' : 'Customer Khata Book'}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  {isUr ? 'غلہ آڑھت لیجر' : 'Mandi Ledger'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isUr
                  ? 'گاہکوں کے ادھار کھاتے، تفصیل مال ترسیل و جزوی وصولات'
                  : 'Customer Credit Accounts, Date-wise Dispatches & Partial Payment Recoveries'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isUr ? '+ نیا کھاتہ کھولیں' : '+ New Customer Khata'}</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatCard
            isLoading={isInitialLoading}
            title={isUr ? 'مارکیٹ کل بقایا' : 'Market Receivables'}
            urduTitle="مارکیٹ بقایا"
            value={`PKR ${totalMarketUdhar.toLocaleString()}`}
            subValue={isUr ? `${activeKhateCount} دکانوں سے وصولی باقی` : `${activeKhateCount} shops pending payment`}
            icon={Coins}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            badge={isUr ? (totalMarketUdhar > 0 ? 'واجب الادا' : 'مکمل وصول') : (totalMarketUdhar > 0 ? 'Outstanding' : 'Cleared')}
            badgeColor={totalMarketUdhar > 0 ? 'red' : 'emerald'}
          />

          <StatCard
            isLoading={isInitialLoading}
            title={isUr ? 'زیر التواء کھاتے' : 'Active Khate'}
            urduTitle="زیر التواء کھاتے"
            value={isUr ? `${activeKhateCount} کھاتے` : `${activeKhateCount} Accounts`}
            subValue={isUr ? 'جن کا بقایا 0 سے زیادہ ہے' : 'Accounts with balance > 0'}
            icon={Building2}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            badge={isUr ? `${khataCustomers.length} کل کھاتے` : `${khataCustomers.length} Total`}
            badgeColor="amber"
          />

          <StatCard
            isLoading={isInitialLoading}
            title={isUr ? 'کل وصول شدہ' : 'Total Recoveries'}
            urduTitle="کل وصول شدہ"
            value={`PKR ${totalRecoveredThisMonth.toLocaleString()}`}
            subValue={isUr ? 'نقد و راست پیمنٹس موصول' : 'Cash & Raast recovered'}
            icon={Wallet}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            badge={isUr ? 'کامیاب وصولی' : 'Recovered'}
            badgeColor="emerald"
          />

          <StatCard
            isLoading={isInitialLoading}
            title={isUr ? 'مکمل بیباق' : 'Settled Accounts'}
            urduTitle="مکمل بیباق"
            value={isUr ? `${settledKhateCount} کھاتے` : `${settledKhateCount} Accounts`}
            subValue={isUr ? 'جن کا ادھار 100% بیباق ہو چکا' : 'Fully settled zero balance'}
            icon={ShieldCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            badge={isUr ? 'صفر بقایا' : 'Zero Balance'}
            badgeColor="blue"
          />
        </div>
      </div>

      {/* Main Full-Width Customer Directory List */}
      <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Search, Filters & Counter Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 group">
              <input
                type="text"
                placeholder={isUr ? 'دکان، نام یا فون نمبر تلاش کریں...' : 'Search shop, name, phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-500/80 focus:border-emerald-700 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 placeholder-emerald-800/70 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 transition-all"
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-emerald-800 group-focus-within:scale-110 transition-all" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-white text-emerald-950 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {isUr
                  ? `تمام (${isInitialLoading ? '•••' : khataCustomers.length})`
                  : `All (${isInitialLoading ? '•••' : khataCustomers.length})`}
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'PENDING'
                    ? 'bg-white text-rose-700 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {isUr
                  ? `واجب الادا (${isInitialLoading ? '•••' : activeKhateCount})`
                  : `Pending (${isInitialLoading ? '•••' : activeKhateCount})`}
              </button>
              <button
                onClick={() => setFilterStatus('SETTLED')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'SETTLED'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {isUr
                  ? `مکمل بیباق (${isInitialLoading ? '•••' : settledKhateCount})`
                  : `Settled (${isInitialLoading ? '•••' : settledKhateCount})`}
              </button>
            </div>
          </div>

          {/* Customer Cards Grid (Clicking any card opens the Detail Modal) */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {isInitialLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-6 gap-2.5 text-emerald-800 font-bold text-xs bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  <span className="tracking-wide">
                    {isUr ? 'گاہکوں کے ادھار کھاتے لوڈ ہو رہے ہیں...' : 'Loading Khata Accounts & Ledgers...'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-max">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex flex-col justify-between h-44 shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-12 bg-slate-200 rounded" />
                              <div className="h-4 w-32 bg-slate-200 rounded" />
                            </div>
                            <div className="h-3 w-36 bg-slate-100 rounded" />
                            <div className="h-3 w-28 bg-slate-100 rounded" />
                          </div>
                          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="h-4 w-28 bg-slate-100 rounded" />
                        <div className="h-7 w-24 bg-slate-200 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  {isUr ? 'کوئی کھاتہ نہیں ملا' : 'No Khata accounts found'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isUr
                    ? 'تلاش کے الفاظ تبدیل کریں یا نیا گاہک رجسٹر کریں۔'
                    : 'Try changing search query or register a new customer account.'}
                </p>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isUr ? '+ نیا کھاتہ کھولیں' : '+ Add New Khata'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-max">
                {filteredCustomers.map((cust) => {
                  const hasPending = cust.currentBalance > 0;
                  const creditLimit = cust.creditLimit || 0;
                  const limitUtilization =
                    creditLimit > 0
                      ? Math.min(100, Math.round((cust.currentBalance / creditLimit) * 100))
                      : 0;

                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleOpenCustomerDetail(cust.id)}
                      className="bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Header: Shop Name & Balance */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                #{cust.id.replace('khata-cust-', 'C')}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                                {isUr ? (cust.urduName || cust.shopName) : cust.shopName}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{cust.customerName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-0.5 font-mono-num text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {cust.phone}
                              </span>
                            </p>

                            {cust.address && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    navigator.clipboard.writeText(cust.address);
                                    notifySuccess(language === 'ur' ? 'لوکیشن ایڈریس کاپی ہو گیا!' : 'Location address copied!');
                                  } catch (_) {
                                    const ta = document.createElement('textarea');
                                    ta.value = cust.address;
                                    document.body.appendChild(ta);
                                    ta.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(ta);
                                    notifySuccess(language === 'ur' ? 'لوکیشن ایڈریس کاپی ہو گیا!' : 'Location address copied!');
                                  }
                                }}
                                className="text-[11px] text-slate-400 hover:text-emerald-700 mt-0.5 flex items-center gap-1 truncate hover:underline cursor-pointer text-left group"
                                title={language === 'ur' ? 'کلک کریں اور پتہ کاپی کریں' : 'Click to copy address'}
                              >
                                <MapPin className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                <span className="truncate">{cust.address}</span>
                                <Copy className="w-2.5 h-2.5 text-slate-300 group-hover:text-emerald-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </div>

                          {/* Balance Display */}
                          <div className="text-right shrink-0 font-mono-num">
                            <p
                              className={`text-base font-black ${
                                hasPending ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              PKR {cust.currentBalance.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                                hasPending
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {hasPending
                                ? (isUr ? 'بقیہ واجب الادا' : 'Pending')
                                : (isUr ? 'مکمل بیباق' : 'Settled')}
                            </span>
                          </div>
                        </div>

                        {/* Credit Limit & Utilization */}
                        {creditLimit > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono-num">
                            <div className="flex items-center justify-between mb-1">
                              <span>
                                {isUr ? 'ادھار کی حد:' : 'Limit:'} PKR {creditLimit.toLocaleString()}
                              </span>
                              <span
                                className={`font-bold ${
                                  limitUtilization > 85 ? 'text-rose-600' : 'text-slate-700'
                                }`}
                              >
                                {limitUtilization}% {isUr ? 'استعمال' : 'used'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  limitUtilization > 85
                                    ? 'bg-rose-500'
                                    : limitUtilization > 50
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${limitUtilization}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom: Click CTA & Direct Delete */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerToDelete(cust);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-transparent hover:border-rose-200"
                          title={isUr ? 'گاہک کھاتہ ڈیلیٹ کریں' : 'Delete Khata Account'}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>{isUr ? 'ڈیلیٹ' : 'Delete'}</span>
                        </button>

                        <span className="font-bold flex items-center gap-0.5 text-emerald-700 group-hover:text-emerald-900 group-hover:translate-x-0.5 transition-all text-xs">
                          {isUr ? 'کھاتہ کھولیں ←' : 'View Ledger →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Detail Ledger Modal ("right wala senario ho sara") */}
      <CustomerLedgerDetailModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        customer={selectedCustomer}
        transactions={customerTransactions}
        onOpenAddPurchase={() => setIsAddPurchaseOpen(true)}
        onOpenReceivePayment={() => setIsReceivePaymentOpen(true)}
        onOpenStatementPrint={() => setIsStatementPrintOpen(true)}
        onOpenEditCustomer={() => setIsEditCustomerOpen(true)}
        onDeleteCustomer={() => {
          if (selectedCustomer) {
            setCustomerToDelete(selectedCustomer);
          }
        }}
        onDeleteTransaction={handleDeleteTx}
        onSendWhatsApp={handleSendWhatsAppReminder}
      />

      {/* Action Sub-Modals (Stacked over detail modal with high z-index) */}
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

      {/* Confirmation Modal for Customer Account Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDeleteCustomer}
        title={isUr ? 'کھاتہ مکمل ڈیلیٹ کریں؟' : 'Delete Khata Account?'}
        itemName={customerToDelete?.shopName || customerToDelete?.customerName || ''}
        itemType={isUr ? 'گاہک ادھار کھاتہ' : 'Customer Khata'}
        description={
          isUr
            ? `کیا آپ واقعی "${customerToDelete?.shopName || customerToDelete?.customerName}" کا کھاتہ ڈیلیٹ کرنا چاہتے ہیں؟ اس گاہک کا تمام سابقہ ادھار، خریداریاں اور پیمنٹس ہمیشہ کے لیے حذف ہو جائیں گی۔`
            : `Are you sure you want to permanently delete "${customerToDelete?.shopName || customerToDelete?.customerName}"? All transaction records and balance will be removed.`
        }
        confirmText={isUr ? 'ہاں، کھاتہ ڈیلیٹ کریں' : 'Delete Account'}
        cancelText={isUr ? 'منسوخ' : 'Cancel'}
      />

      {/* Confirmation Modal for Ledger Transaction Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteKhataTransaction(txToDelete.id);
            notifyInfo(
              isUr
                ? 'ٹرانزیکشن ڈیلیٹ ہو گئی اور کھاتہ بیلنس خودکار ایڈجسٹ ہو گیا۔'
                : 'Transaction deleted and customer balance adjusted.'
            );
          }
          setTxToDelete(null);
        }}
        title={isUr ? 'کھاتہ اندراج حذف کرنے کی تصدیق' : 'Confirm Transaction Deletion'}
        description={
          isUr
            ? 'کیا آپ واقعی اس ٹرانزیکشن کو حذف کرنا چاہتے ہیں؟ اس کسٹمر کا کھاتہ بیلنس خودکار طور پر ریورس ہو جائے گا۔'
            : 'Are you sure you want to delete this transaction entry? The customer balance will be automatically reversed.'
        }
        itemName={txToDelete?.desc || ''}
        itemType={isUr ? 'اندراج / تفصیل:' : 'Transaction Details:'}
        confirmText={isUr ? 'ہاں، ٹرانزیکشن حذف کریں' : 'Yes, Delete Transaction'}
      />
    </div>
  );
};
