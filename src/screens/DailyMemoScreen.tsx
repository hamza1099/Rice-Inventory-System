import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MemoFilterBar } from '../components/memo/MemoFilterBar';
import { StatCard } from '../components/common/StatCard';
import { MemoLedgerTable } from '../components/memo/MemoLedgerTable';
import { DrawerAuditCard } from '../components/memo/DrawerAuditCard';
import { ReceiptPrintModal } from '../components/pos/ReceiptPrintModal';
import { DollarSign, Wallet, CreditCard, TrendingUp, X } from 'lucide-react';

export const DailyMemoScreen: React.FC = () => {
  const { memos } = usePos();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePeriod, setActivePeriod] = useState<string>('7days');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');

  const filteredMemos = memos.filter((m) => {
    const matchesSearch =
      m.memoNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = selectedPayment === 'ALL' || m.paymentMode === selectedPayment;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-3">
      {/* Filters & Export Header */}
      <MemoFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activePeriod={activePeriod}
        setActivePeriod={setActivePeriod}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
      />

      {/* 4 Stat Cards from Image 1 */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          title="PERIOD SPOT SALES"
          urduTitle="کل نقد فروخت"
          value="PKR 1,048,250"
          subValue="542 Spot Invoices (7 Days) • 0 CREDIT / KHATA"
          badge="SETTLED"
          badgeColor="emerald"
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-800"
        />

        <StatCard
          title="CASH COLLECTED"
          urduTitle="کیش وصولی"
          value="PKR 784,000"
          subValue="418 Cash Receipts Settled • 100% RECONCILED"
          badge="100%"
          badgeColor="emerald"
          icon={Wallet}
          iconBg="bg-blue-100"
          iconColor="text-blue-800"
        />

        <StatCard
          title="RAAST & ONLINE IBFT"
          urduTitle="راست / آن لائن"
          value="PKR 264,250"
          subValue="Instant Bank Clearing • 124 TRANS"
          badge="VERIFIED"
          badgeColor="blue"
          icon={CreditCard}
          iconBg="bg-purple-100"
          iconColor="text-purple-800"
        />

        <StatCard
          title="GROSS PROFIT"
          urduTitle="مجموعی منافع"
          value="PKR 172,400"
          subValue="Total Volume: 42.8 Tons • AVG PKR 26.5/KG"
          badge="+16.4%"
          badgeColor="emerald"
          icon={TrendingUp}
          iconBg="bg-amber-100"
          iconColor="text-amber-800"
        />
      </div>

      {/* Active Filters Pill */}
      <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
        <span className="font-bold text-[11px] text-slate-400 uppercase">Active Filters:</span>
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono-num text-[11px] font-semibold">
          18 Oct - 24 Oct (7 Days)
        </span>
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
          Counter 01 (S. Bukhari)
        </span>
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
          All Payment Types
        </span>
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedPayment('ALL');
          }}
          className="text-emerald-700 hover:text-emerald-900 font-bold ml-auto text-[11px] flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Memo Records Table */}
      <MemoLedgerTable memos={filteredMemos} />

      {/* Bottom Shift Reconciliation & Drawer Audit */}
      <DrawerAuditCard />

      {/* Receipt Modal */}
      <ReceiptPrintModal />
    </div>
  );
};
