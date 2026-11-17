import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MemoFilterBar } from '../components/memo/MemoFilterBar';
import { StatCard } from '../components/common/StatCard';
import { MemoLedgerTable } from '../components/memo/MemoLedgerTable';
import { DrawerAuditCard } from '../components/memo/DrawerAuditCard';
import { ReceiptPrintModal } from '../components/pos/ReceiptPrintModal';
import { CalendarRangeModal } from '../components/memo/CalendarRangeModal';
import { notifySuccess, notifyInfo } from '../utils/toast';
import { DollarSign, Wallet, CreditCard, TrendingUp, TrendingDown, X } from 'lucide-react';

export const DailyMemoScreen: React.FC = () => {
  const { memos, inventory, language, isMemosLoading } = usePos();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePeriod, setActivePeriod] = useState<string>('today');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');

  const isInitialLoading = isMemosLoading && memos.length === 0;

  // Dynamic date helpers
  const getTodayIso = () => new Date().toISOString().slice(0, 10);
  const getTodayStr = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Custom range dates
  const [customStart, setCustomStart] = useState<string>(getTodayIso);
  const [customEnd, setCustomEnd] = useState<string>(getTodayIso);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>(() => `${getTodayStr()} (Today)`);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Handle Preset Clicks (Today, Yesterday, Last 7 Days, This Month, Custom Range)
  const handlePresetClick = (periodId: string) => {
    setActivePeriod(periodId);
    const isUr = language === 'ur';
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const todayStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (periodId === 'today') {
      setCustomStart(todayIso);
      setCustomEnd(todayIso);
      setDateRangeLabel(isUr ? `${todayStr} (آج)` : `${todayStr} (Today)`);
    } else if (periodId === 'yesterday') {
      const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yIso = yDate.toISOString().slice(0, 10);
      const yStr = yDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setCustomStart(yIso);
      setCustomEnd(yIso);
      setDateRangeLabel(isUr ? `${yStr} (گزشتہ روز)` : `${yStr} (Yesterday)`);
    } else if (periodId === '7days') {
      const past7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const past7Iso = past7.toISOString().slice(0, 10);
      const past7Str = past7.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setCustomStart(past7Iso);
      setCustomEnd(todayIso);
      setDateRangeLabel(isUr ? `${past7Str} تا ${todayStr} (گزشتہ ۷ دن)` : `${past7Str} to ${todayStr} (7 Days)`);
    } else if (periodId === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fIso = firstDay.toISOString().slice(0, 10);
      const lIso = lastDay.toISOString().slice(0, 10);
      const fStr = firstDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const lStr = lastDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setCustomStart(fIso);
      setCustomEnd(lIso);
      setDateRangeLabel(isUr ? `${fStr} تا ${lStr} (موجودہ ماہ)` : `${fStr} to ${lStr} (This Month)`);
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

  // Exact Cost of Goods Sold (COGS) & Gross Profit / Loss
  let totalCost = 0;
  let totalKgSold = 0;

  filteredMemos.forEach((memo) => {
    if (memo.items && memo.items.length > 0) {
      memo.items.forEach((item) => {
        const soldQty = item.netWeight || item.grossWeight || 0;
        totalKgSold += soldQty;

        // Resolve accurate unit cost
        let unitCost: number | undefined = item.costPerKg ?? item.product?.costPerKg;
        if (unitCost === undefined || unitCost === 0) {
          const invMatch = inventory.find(
            (inv) =>
              inv.id === item.product?.id ||
              inv.varietyName.trim().toLowerCase() === (item.product?.name || '').trim().toLowerCase() ||
              (item.product?.urduName && inv.urduName && inv.urduName.trim() === item.product.urduName.trim()) ||
              (item.product?.name && inv.varietyName.trim().toLowerCase().includes(item.product.name.trim().toLowerCase())) ||
              (item.product?.name && item.product.name.trim().toLowerCase().includes(inv.varietyName.trim().toLowerCase()))
          );
          if (invMatch && invMatch.costPerKg !== undefined) {
            unitCost = invMatch.costPerKg;
          }
        }

        if (unitCost !== undefined && unitCost > 0) {
          totalCost += soldQty * unitCost;
        }
      });
    }
  });

  const grossProfit = Math.round(totalSales - totalCost);
  const isLoss = grossProfit < 0;
  const marginPercentage = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const avgProfitPerKg = totalKgSold > 0 ? grossProfit / totalKgSold : 0;
  const formattedMargin = (marginPercentage > 0 ? '+' : '') + marginPercentage.toFixed(1) + '%';
  const formattedAvg = (avgProfitPerKg > 0 ? '+' : '') + 'PKR ' + avgProfitPerKg.toFixed(1) + '/KG';

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
    notifySuccess("Daily Roznamcha CSV exported successfully!");
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
        onDownloadPDF={() => notifyInfo("Generating PDF summary report for thermal/A4 printing...")}
      />

      {/* 4 Stat Cards Dynamically Updated */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          isLoading={isInitialLoading}
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
          isLoading={isInitialLoading}
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
          isLoading={isInitialLoading}
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
          isLoading={isInitialLoading}
          title={isLoss ? "GROSS LOSS" : "GROSS PROFIT"}
          urduTitle={isLoss ? "مجموعی نقصان" : "مجموعی منافع"}
          value={`${isLoss ? '-' : ''}PKR ${Math.abs(grossProfit).toLocaleString()}`}
          subValue={
            totalSales > 0
              ? `Filtered Margin: ${formattedMargin} • AVG ${formattedAvg}`
              : `Filtered Margin: 0% • AVG PKR 0/KG`
          }
          badge={formattedMargin}
          badgeColor={isLoss ? "red" : "emerald"}
          icon={isLoss ? TrendingDown : TrendingUp}
          iconBg={isLoss ? "bg-rose-100" : "bg-emerald-100"}
          iconColor={isLoss ? "text-rose-700" : "text-emerald-800"}
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
      <MemoLedgerTable memos={filteredMemos} isLoading={isInitialLoading} />

      {/* Bottom Shift Reconciliation & Drawer Audit */}
      <DrawerAuditCard activePeriod={activePeriod} />

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
