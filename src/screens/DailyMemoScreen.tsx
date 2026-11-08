import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MemoFilterBar } from '../components/memo/MemoFilterBar';
import { StatCard } from '../components/common/StatCard';
import { MemoLedgerTable } from '../components/memo/MemoLedgerTable';
import { DrawerAuditCard } from '../components/memo/DrawerAuditCard';
import { ReceiptPrintModal } from '../components/pos/ReceiptPrintModal';
import { CalendarRangeModal } from '../components/memo/CalendarRangeModal';
import { DollarSign, Wallet, CreditCard, TrendingUp, X } from 'lucide-react';

export const DailyMemoScreen: React.FC = () => {
  const { memos } = usePos();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePeriod, setActivePeriod] = useState<string>('7days');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');

  // Custom range dates
  const [customStart, setCustomStart] = useState<string>('2024-10-18');
  const [customEnd, setCustomEnd] = useState<string>('2024-10-24');
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('18 OCT 2024 to 24 OCT 2024 (7 Days)');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Handle Preset Clicks (Today, Yesterday, Last 7 Days, This Month, Custom Range)
  const handlePresetClick = (periodId: string) => {
    setActivePeriod(periodId);
    if (periodId === 'today') {
      setCustomStart('2024-10-24');
      setCustomEnd('2024-10-24');
      setDateRangeLabel('24 OCT 2024 (Today • آج)');
    } else if (periodId === 'yesterday') {
      setCustomStart('2024-10-23');
      setCustomEnd('2024-10-23');
      setDateRangeLabel('23 OCT 2024 (Yesterday • گزشتہ روز)');
    } else if (periodId === '7days') {
      setCustomStart('2024-10-18');
      setCustomEnd('2024-10-24');
      setDateRangeLabel('18 OCT 2024 to 24 OCT 2024 (7 Days)');
    } else if (periodId === 'month') {
      setCustomStart('2024-10-01');
      setCustomEnd('2024-10-31');
      setDateRangeLabel('01 OCT 2024 to 31 OCT 2024 (This Month)');
    } else if (periodId === 'custom') {
      setIsCalendarOpen(true);
    }
  };

  const handleApplyCustomRange = (start: string, end: string, label: string) => {
    setActivePeriod('custom');
    setCustomStart(start);
    setCustomEnd(end);
    setDateRangeLabel(label);
  };

  // Helper to parse memo date string like "24 Oct 2024" into a comparable Date
  const parseMemoDate = (dStr: string): Date => {
    return new Date(dStr);
  };

  // Filter memos by Search, Payment Mode, and Date Range
  const filteredMemos = memos.filter((m) => {
    const matchesSearch =
      m.memoNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = selectedPayment === 'ALL' || m.paymentMode === selectedPayment;

    // Date filtering
    const mDate = parseMemoDate(m.dateStr);
    const sDate = new Date(customStart);
    sDate.setHours(0, 0, 0, 0);
    const eDate = new Date(customEnd);
    eDate.setHours(23, 59, 59, 999);

    const matchesDate = mDate >= sDate && mDate <= eDate;

    return matchesSearch && matchesPayment && matchesDate;
  });

  // Dynamic calculations for Stat Cards based on current filter
  const totalSales = filteredMemos.reduce((sum, m) => sum + m.netAmount, 0);
  const cashCollected = filteredMemos
    .filter((m) => m.paymentMode === 'SPOT CASH')
    .reduce((sum, m) => sum + m.netAmount, 0);
  const raastCollected = filteredMemos
    .filter((m) => m.paymentMode === 'RAAST ONLINE')
    .reduce((sum, m) => sum + m.netAmount, 0);
  const grossProfit = Math.round(totalSales * 0.164); // ~16.4% Mandi margin

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = "Memo No,Date,Time,Customer,Items,Weight Summary,Payment Mode,Gross (PKR),Discount (PKR),Net Amount (PKR),Cashier\n";
    const rows = filteredMemos
      .map(
        (m) =>
          `"${m.memoNo}","${m.dateStr}","${m.timeStr}","${m.customerName}","${m.itemsSummary}","${m.weightSummary}","${m.paymentMode}",${m.grossAmount},${m.discount},${m.netAmount},"${m.cashier}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Daily_Roznamcha_${customStart}_to_${customEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPayment('ALL');
    handlePresetClick('7days');
  };

  return (
    <div className="space-y-3">
      {/* Filters & Export Header */}
      <MemoFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activePeriod={activePeriod}
        onPresetClick={handlePresetClick}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        dateRangeLabel={dateRangeLabel}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onExportCSV={handleExportCSV}
        onDownloadPDF={() => alert("Downloading PDF summary report...")}
      />

      {/* 4 Stat Cards Dynamically Updated */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          title="PERIOD SPOT SALES"
          urduTitle="کل نقد فروخت"
          value={`PKR ${totalSales.toLocaleString()}`}
          subValue={`${filteredMemos.length} Spot Invoices • 0 CREDIT / KHATA`}
          badge="SETTLED"
          badgeColor="emerald"
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-800"
        />

        <StatCard
          title="CASH COLLECTED"
          urduTitle="کیش وصولی"
          value={`PKR ${cashCollected.toLocaleString()}`}
          subValue={`${filteredMemos.filter((m) => m.paymentMode === 'SPOT CASH').length} Cash Receipts Settled • 100% RECONCILED`}
          badge="100%"
          badgeColor="emerald"
          icon={Wallet}
          iconBg="bg-blue-100"
          iconColor="text-blue-800"
        />

        <StatCard
          title="RAAST & ONLINE IBFT"
          urduTitle="راست / آن لائن"
          value={`PKR ${raastCollected.toLocaleString()}`}
          subValue={`${filteredMemos.filter((m) => m.paymentMode === 'RAAST ONLINE').length} Online Transfers • Instant Bank Clearing`}
          badge="VERIFIED"
          badgeColor="blue"
          icon={CreditCard}
          iconBg="bg-purple-100"
          iconColor="text-purple-800"
        />

        <StatCard
          title="GROSS PROFIT"
          urduTitle="مجموعی منافع"
          value={`PKR ${grossProfit.toLocaleString()}`}
          subValue={`Filtered Margin: +16.4% • AVG PKR 26.5/KG`}
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
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="bg-slate-100 hover:bg-emerald-50 text-slate-800 px-2 py-0.5 rounded font-mono-num text-[11px] font-semibold border border-slate-200 cursor-pointer"
        >
          {dateRangeLabel}
        </button>
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
          Counter 01 (S. Bukhari)
        </span>
        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
          {selectedPayment === 'ALL' ? 'All Payment Types' : selectedPayment}
        </span>
        {searchTerm && (
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
            Search: "{searchTerm}"
          </span>
        )}
        <button
          onClick={handleResetFilters}
          className="text-emerald-700 hover:text-emerald-900 font-bold ml-auto text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Memo Records Table */}
      <MemoLedgerTable memos={filteredMemos} />

      {/* Bottom Shift Reconciliation & Drawer Audit */}
      <DrawerAuditCard />

      {/* Calendar Range Modal */}
      <CalendarRangeModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        startDate={customStart}
        endDate={customEnd}
        onApplyRange={handleApplyCustomRange}
      />

      {/* Receipt Modal */}
      <ReceiptPrintModal />
    </div>
  );
};
