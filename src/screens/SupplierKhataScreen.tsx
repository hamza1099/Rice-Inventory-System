import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { StatCard } from '../components/common/StatCard';
import { AddSupplierModal } from '../components/supplier/AddSupplierModal';
import { EditSupplierModal } from '../components/supplier/EditSupplierModal';
import { AddSupplierPurchaseModal } from '../components/supplier/AddSupplierPurchaseModal';
import { PaySupplierModal } from '../components/supplier/PaySupplierModal';
import { SupplierStatementPrintModal } from '../components/supplier/SupplierStatementPrintModal';
import { SupplierLedgerDetailModal } from '../components/supplier/SupplierLedgerDetailModal';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { notifySuccess } from '../utils/toast';
import type { Supplier, SupplierTransaction } from '../types';
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  Wallet,
  Truck,
  Printer,
  Share2,
  Trash2,
  Edit2,
  DollarSign,
  PackagePlus,
  Coins,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const SupplierKhataScreen: React.FC = () => {
  const {
    suppliers,
    isSuppliersLoading,
    supplierTransactions,
    selectedSupplierId,
    setSelectedSupplierId,
    deleteSupplier,
    deleteSupplierTransaction,
    language
  } = usePos();

  const isUr = language === 'ur';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');
  const [mobileSupplierView, setMobileSupplierView] = useState<'list' | 'detail'>('list');

  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState<boolean>(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState<boolean>(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState<boolean>(false);
  const [isPaySupplierOpen, setIsPaySupplierOpen] = useState<boolean>(false);
  const [isStatementPrintOpen, setIsStatementPrintOpen] = useState<boolean>(false);
  const [viewTxDetail, setViewTxDetail] = useState<SupplierTransaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<SupplierTransaction | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Active selected supplier
  const selectedSupplier = useMemo(() => {
    if (!selectedSupplierId) return suppliers[0] || null;
    return suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0] || null;
  }, [suppliers, selectedSupplierId]);

  // Selected supplier transactions (newest first for UI view)
  const currentSupplierTxs = useMemo(() => {
    if (!selectedSupplier) return [];
    return supplierTransactions
      .filter((tx) => tx.supplierId === selectedSupplier.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [supplierTransactions, selectedSupplier]);

  // Filtered suppliers list
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (filterStatus === 'PENDING' && s.currentBalance <= 0) return false;
      if (filterStatus === 'SETTLED' && s.currentBalance > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchUrdu = s.urduName ? s.urduName.toLowerCase().includes(q) : false;
        const matchCity = s.city.toLowerCase().includes(q);
        const matchPerson = s.contactPerson ? s.contactPerson.toLowerCase().includes(q) : false;
        const matchPhone = s.phone.includes(q);
        return matchName || matchUrdu || matchCity || matchPerson || matchPhone;
      }
      return true;
    });
  }, [suppliers, filterStatus, searchQuery]);

  // Financial aggregates across all suppliers
  const totalPurchasesAll = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
  }, [suppliers]);

  const totalPaidAll = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  }, [suppliers]);

  const totalPayableAll = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.currentBalance || 0), 0);
  }, [suppliers]);

  const pendingMillsCount = useMemo(() => {
    return suppliers.filter((s) => s.currentBalance > 0).length;
  }, [suppliers]);

  // Quick WhatsApp for selected supplier
  const handleOpenWhatsApp = (phone: string, suppName: string, balance: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `السلام علیکم! ${suppName}\n` +
      `بخاری رائس ٹریڈرز راولپنڈی کی جانب سے کھاتہ اپ ڈیٹ:\n` +
      `ہمارے ذمہ آپ کی کل واجب الادا رقم: PKR ${balance.toLocaleString()}\n` +
      `برائے مہربانی اپنا کھاتہ چیک فرما لیں۔ شکریہ!`
    );
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      {/* Top 4 Stat Cards */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatCard
            title={isUr ? 'کل چاول ملز و سپلائرز' : 'TOTAL MILLS & VENDORS'}
            value={suppliers.length.toString()}
            subValue={`${pendingMillsCount} ${isUr ? 'ملوں کو رقم دینی ہے' : 'Active Payables'}`}
            badge={isUr ? 'مل نیٹ ورک' : 'Mills Network'}
            badgeColor="emerald"
            icon={Building2}
          />

          <StatCard
            title={isUr ? 'کل مال خریداری (بل)' : 'TOTAL STOCK PURCHASED'}
            value={`PKR ${totalPurchasesAll.toLocaleString()}`}
            subValue={isUr ? 'غلہ منڈی و ملوں سے خریدا گیا مال' : 'Cumulative inward supply bills'}
            badge={isUr ? 'خریداری' : 'Purchases'}
            badgeColor="purple"
            icon={Truck}
          />

          <StatCard
            title={isUr ? 'کل ادا شدہ رقم' : 'TOTAL PAID TO MILLS'}
            value={`PKR ${totalPaidAll.toLocaleString()}`}
            subValue={isUr ? 'بینک، کیش و چیک ادائیگی' : 'Bank, Raast & Cash cleared'}
            badge={isUr ? 'ادائیگی' : 'Paid'}
            badgeColor="blue"
            icon={Wallet}
          />

          <StatCard
            title={isUr ? 'کل واجب الادا رقم (دینا ہے)' : 'TOTAL PAYABLES DUE'}
            value={`PKR ${totalPayableAll.toLocaleString()}`}
            subValue={isUr ? 'سپلائرز کے ذمہ بقایا رقم' : 'Outstanding amount we owe'}
            badge={isUr ? 'واجب الادا' : 'Owed to Mills'}
            badgeColor="amber"
            icon={ShieldAlert}
          />
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Suppliers Directory */}
        <div className={`w-full lg:w-80 md:lg:w-96 bg-white lg:border-r border-slate-200 flex flex-col h-full shrink-0 ${
          mobileSupplierView === 'detail' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Header & Add Button */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  <span>{isUr ? 'مل و سپلائر فہرست' : 'Mills & Suppliers'}</span>
                </h2>
                <p className="text-[10px] text-slate-400">
                  {filteredSuppliers.length} {isUr ? 'ملیں موجود ہیں' : 'records found'}
                </p>
              </div>

              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isUr ? 'نیا مل کھاتہ' : 'New Mill'}</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUr ? 'مل کا نام، شہر، فون یا مالک...' : 'Search mill, city, phone...'}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 text-slate-800"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isUr ? 'تمام' : 'All'} ({suppliers.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterStatus === 'PENDING'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                {isUr ? 'دینا ہے' : 'Due'} ({pendingMillsCount})
              </button>
              <button
                onClick={() => setFilterStatus('SETTLED')}
                className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterStatus === 'SETTLED'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                {isUr ? 'بیباق' : 'Settled'}
              </button>
            </div>
          </div>

          {/* Suppliers Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{isUr ? 'کوئی مل یا سپلائر نہیں ملا' : 'No suppliers match your search'}</p>
              </div>
            ) : (
              filteredSuppliers.map((supp) => {
                const isSelected = selectedSupplier?.id === supp.id;
                const hasDue = supp.currentBalance > 0;

                return (
                  <div
                    key={supp.id}
                    onClick={() => {
                      setSelectedSupplierId(supp.id);
                      setMobileSupplierView('detail');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate text-xs">
                          {supp.name}
                        </h3>
                        {supp.urduName && (
                          <p className="text-[11px] text-emerald-900 font-sans font-bold truncate mt-0.5">
                            {supp.urduName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {supp.city}
                          </span>
                          <span>•</span>
                          <span className="truncate">{supp.contactPerson || supp.phone}</span>
                        </div>
                      </div>

                      {/* Balance Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            hasDue
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {hasDue ? `PKR ${supp.currentBalance.toLocaleString()}` : (isUr ? 'بیباق' : 'SETTLED')}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {hasDue ? (isUr ? 'دینا ہے' : 'Payable') : (isUr ? 'مکمل ادا' : 'Paid')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Supplier Details & Full Ledger */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-50 ${
          mobileSupplierView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          {selectedSupplier ? (
            <>
              {/* Top Banner of Selected Supplier */}
              <div className="bg-white border-b border-slate-200 p-3 sm:p-4 shadow-2xs">
                {/* Mobile Back Button to return to list */}
                <div className="lg:hidden mb-2.5">
                  <button
                    type="button"
                    onClick={() => setMobileSupplierView('list')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    <span>←</span>
                    <span>{isUr ? 'ملوں کی لسٹ پر واپس جائیں' : 'Back to Mills List'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        #{selectedSupplier.id}
                      </span>
                      <h1 className="text-base font-black text-slate-900">
                        {selectedSupplier.name}
                      </h1>
                      {selectedSupplier.status === 'SETTLED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {isUr ? 'بیباق کھاتہ' : 'Settled'}
                        </span>
                      )}
                    </div>

                    {selectedSupplier.urduName && (
                      <p className="text-sm font-bold text-emerald-900 font-sans mt-0.5" dir="rtl">
                        {selectedSupplier.urduName}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                      {selectedSupplier.contactPerson && (
                        <span>
                          {isUr ? 'مالک / رابطہ:' : 'Contact:'} <strong className="text-slate-800">{selectedSupplier.contactPerson}</strong>
                        </span>
                      )}
                      <span>
                        <Phone className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                        <strong className="text-slate-800">{selectedSupplier.phone}</strong>
                      </span>
                      <span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                        <strong className="text-slate-800">{selectedSupplier.city}</strong>
                        {selectedSupplier.address && ` (${selectedSupplier.address})`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Record Inward / Supply Bill */}
                    <button
                      onClick={() => setIsAddPurchaseOpen(true)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <PackagePlus className="w-4 h-4" />
                      <span>{isUr ? 'آمد مال (بل درج کریں)' : '+ Record Inward'}</span>
                    </button>

                    {/* Make Payment */}
                    <button
                      onClick={() => setIsPaySupplierOpen(true)}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{isUr ? 'ادائیگی رقم' : '+ Pay Mill'}</span>
                    </button>

                    {/* Print / PDF Statement Sheet (The sheet requested by user!) */}
                    <button
                      onClick={() => setIsStatementPrintOpen(true)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isUr ? 'کھاتہ شیٹ (PDF / پرنٹ)' : 'Print / PDF Sheet'}</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => handleOpenWhatsApp(selectedSupplier.phone, selectedSupplier.name, selectedSupplier.currentBalance)}
                      title={isUr ? 'واٹس ایپ پر میسج کریں' : 'Send WhatsApp Reminder'}
                      className="p-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Edit Supplier */}
                    <button
                      onClick={() => setIsEditSupplierOpen(true)}
                      title={isUr ? 'مل معلومات تبدیل کریں' : 'Edit Supplier'}
                      className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Supplier */}
                    <button
                      onClick={() => setSupplierToDelete(selectedSupplier)}
                      title={isUr ? 'سپلائر ڈیلیٹ کریں' : 'Delete Supplier'}
                      className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mini Account Summary Banner for Selected Supplier */}
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">
                      {isUr ? 'کل مال خریداری' : 'Total Purchased'}
                    </p>
                    <p className="text-sm font-black text-amber-950 mt-0.5">
                      PKR {selectedSupplier.totalPurchases.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">
                      {isUr ? 'کل ادا شدہ رقم' : 'Total Paid'}
                    </p>
                    <p className="text-sm font-black text-blue-950 mt-0.5">
                      PKR {selectedSupplier.totalPaid.toLocaleString()}
                    </p>
                  </div>

                  <div className={`rounded-lg p-2.5 border ${
                    selectedSupplier.currentBalance > 0
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}>
                    <p className={`text-[10px] font-bold uppercase ${
                      selectedSupplier.currentBalance > 0 ? 'text-rose-800' : 'text-emerald-800'
                    }`}>
                      {isUr ? 'واجب الادا بقایا رقم (دینا ہے)' : 'Net Outstanding Payable'}
                    </p>
                    <p className={`text-base font-black mt-0.5 ${
                      selectedSupplier.currentBalance > 0 ? 'text-rose-950' : 'text-emerald-950'
                    }`}>
                      PKR {selectedSupplier.currentBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-800" />
                      <span>{isUr ? 'آمد مال و ادائیگیاں (کھاتہ روزنامچہ)' : 'Inward Supply & Payment Records'}</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {currentSupplierTxs.length} {isUr ? 'اندراجات' : 'entries'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 w-28">{isUr ? 'تاریخ و وقت' : 'Date & Time'}</th>
                          <th className="py-2.5 px-3 w-24">{isUr ? 'نوعیت' : 'Type'}</th>
                          <th className="py-2.5 px-3">{isUr ? 'تفصیل آمد مال / ادائیگی' : 'Description & Vehicle / Bilty'}</th>
                          <th className="py-2.5 px-3 text-right w-24 text-amber-900">{isUr ? 'آمد مال (+)' : 'Bill (+)'}</th>
                          <th className="py-2.5 px-3 text-right w-24 text-blue-800">{isUr ? 'ادائیگی (-)' : 'Paid (-)'}</th>
                          <th className="py-2.5 px-3 text-right w-28 text-slate-900">{isUr ? 'بقایا (دینا ہے)' : 'Balance'}</th>
                          <th className="py-2.5 px-3 text-center w-20">{isUr ? 'ایکشن' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentSupplierTxs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              <Truck className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-800" />
                              <p className="font-semibold">{isUr ? 'اس مل کے کھاتے میں ابھی تک کوئی ٹرانزیکشن نہیں ہے۔' : 'No transactions recorded for this supplier yet.'}</p>
                              <p className="text-[11px] mt-1 text-slate-500">
                                {isUr ? '"آمد مال" یا "ادائیگی رقم" کے بٹن پر کلک کر کے نیا اندراج کریں۔' : 'Click "+ Record Inward" or "+ Pay Mill" to add first entry.'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          currentSupplierTxs.map((tx) => {
                            const isPurchase = tx.type === 'PURCHASE';
                            const isPayment = tx.type === 'PAYMENT';

                            return (
                              <tr
                                key={tx.id}
                                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                onClick={() => setViewTxDetail(tx)}
                              >
                                <td className="py-2.5 px-3 align-top whitespace-nowrap text-slate-600 font-medium">
                                  {tx.dateStr}
                                  <div className="text-[10px] text-slate-400">{tx.timeStr}</div>
                                </td>

                                <td className="py-2.5 px-3 align-top">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isPurchase
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : isPayment
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 align-top">
                                  <div className="font-bold text-slate-800">{tx.description}</div>

                                  {/* Vehicle & Bilty Badges */}
                                  {(tx.vehicleNo || tx.biltyNo) && (
                                    <div className="flex gap-2 mt-1">
                                      {tx.vehicleNo && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                                          <Truck className="w-3 h-3 text-slate-500" />
                                          {tx.vehicleNo}
                                        </span>
                                      )}
                                      {tx.biltyNo && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                          Bilty: {tx.biltyNo}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Items Breakdown snippet */}
                                  {tx.items && tx.items.length > 0 && (
                                    <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-emerald-300">
                                      {tx.items.slice(0, 2).map((it, idx) => (
                                        <div key={idx} className="text-[10px] text-slate-500 flex justify-between">
                                          <span>• {it.urduName || it.productName} ({it.bags} {it.unit === 'dozen' ? 'درجن' : it.unit === 'pack' ? 'پیکٹ' : 'بوریاں'} {it.unit !== 'dozen' && it.weightPerBag ? `x ${it.weightPerBag}kg` : ''})</span>
                                          <span className="font-medium">PKR {it.subtotal.toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Payment Mode */}
                                  {isPayment && (
                                    <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                                      Mode: {tx.paymentMode || 'Cash'} {tx.referenceNo && `• Ref: ${tx.referenceNo}`}
                                    </div>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 align-top text-right font-bold text-amber-900 whitespace-nowrap">
                                  {tx.billAmount > 0 ? `PKR ${tx.billAmount.toLocaleString()}` : '-'}
                                </td>

                                <td className="py-2.5 px-3 align-top text-right font-bold text-blue-700 whitespace-nowrap">
                                  {tx.paidAmount > 0 ? `PKR ${tx.paidAmount.toLocaleString()}` : '-'}
                                </td>

                                <td className="py-2.5 px-3 align-top text-right font-black text-slate-900 whitespace-nowrap">
                                  PKR {tx.balanceAfter.toLocaleString()}
                                </td>

                                <td
                                  className="py-2.5 px-3 align-top text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => setTxToDelete(tx)}
                                    title={isUr ? 'اندراج ڈیلیٹ کریں' : 'Delete transaction'}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <Building2 className="w-12 h-12 mb-3 opacity-30 text-emerald-800" />
              <p className="text-sm font-bold text-slate-700">{isUr ? 'کوئی مل یا سپلائر منتخب نہیں ہے' : 'No Supplier Selected'}</p>
              <p className="text-xs text-slate-500 mt-1">{isUr ? 'بائیں جانب سے کسی مل پر کلک کریں یا نیا کھاتہ درج کریں۔' : 'Select a mill from the left list or create a new one.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSupplierCreated={(supp) => setSelectedSupplierId(supp.id)}
      />

      <EditSupplierModal
        isOpen={isEditSupplierOpen}
        supplier={selectedSupplier}
        onClose={() => setIsEditSupplierOpen(false)}
      />

      <AddSupplierPurchaseModal
        isOpen={isAddPurchaseOpen}
        supplier={selectedSupplier}
        onClose={() => setIsAddPurchaseOpen(false)}
      />

      <PaySupplierModal
        isOpen={isPaySupplierOpen}
        supplier={selectedSupplier}
        onClose={() => setIsPaySupplierOpen(false)}
      />

      {selectedSupplier && (
        <SupplierStatementPrintModal
          isOpen={isStatementPrintOpen}
          supplier={selectedSupplier}
          transactions={currentSupplierTxs}
          onClose={() => setIsStatementPrintOpen(false)}
        />
      )}

      <SupplierLedgerDetailModal
        isOpen={Boolean(viewTxDetail)}
        supplier={selectedSupplier}
        transaction={viewTxDetail}
        onClose={() => setViewTxDetail(null)}
      />

      {/* Confirm Delete Transaction Modal */}
      {txToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(txToDelete)}
          onClose={() => setTxToDelete(null)}
          onConfirm={() => {
            deleteSupplierTransaction(txToDelete.id);
            setTxToDelete(null);
            notifySuccess(isUr ? 'اندراج کامیابی سے ڈیلیٹ ہو گیا!' : 'Transaction deleted!');
          }}
          title={isUr ? 'ٹرانزیکشن ڈیلیٹ کریں؟' : 'Delete Transaction?'}
          description={
            isUr
              ? `کیا آپ واقعی اس ٹرانزیکشن "${txToDelete.description}" کو ڈیلیٹ کرنا چاہتے ہیں؟ اس سے مل کا بقایا بیلنس دوبارہ درست ہو جائے گا۔`
              : `Are you sure you want to delete "${txToDelete.description}"? The supplier balance will be adjusted accordingly.`
          }
        />
      )}

      {/* Confirm Delete Supplier Modal */}
      {supplierToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(supplierToDelete)}
          onClose={() => setSupplierToDelete(null)}
          onConfirm={() => {
            deleteSupplier(supplierToDelete.id);
            setSupplierToDelete(null);
            notifySuccess(isUr ? 'مل / سپلائر کھاتہ ڈیلیٹ ہو گیا!' : 'Supplier deleted!');
          }}
          title={isUr ? 'سپلائر / مل کھاتہ ڈیلیٹ کریں؟' : 'Delete Supplier Account?'}
          description={
            isUr
              ? `کیا آپ واقعی مل "${supplierToDelete.name}" اور اس کی تمام ٹرانزیکشنز ڈیلیٹ کرنا چاہتے ہیں؟`
              : `Are you sure you want to delete "${supplierToDelete.name}" and all its transaction history?`
          }
        />
      )}
    </div>
  );
};
