import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { StatCard } from '../components/common/StatCard';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { GodownStats } from '../components/inventory/GodownStats';
import { StockInwardModal } from '../components/inventory/StockInwardModal';
import { EditVarietyModal } from '../components/inventory/EditVarietyModal';
import { AddVarietyModal } from '../components/inventory/AddVarietyModal';
import type { InventoryItem } from '../types';
import {
  Boxes,
  BadgeDollarSign,
  AlertTriangle,
  Droplets,
  Plus,
  FileText,
  Search,
  PlusCircle
} from 'lucide-react';

export const StockInventoryScreen: React.FC = () => {
  const { inventory, setIsMandiChitOpen, deleteInventoryItem } = usePos();
  const [selectedFilter, setSelectedFilter] = useState<string>('All Rice');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [inwardItem, setInwardItem] = useState<InventoryItem | null>(null);
  const [rateEditItem, setRateEditItem] = useState<InventoryItem | null>(null);
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState<boolean>(false);

  // Dynamic calculations
  const totalValuation = inventory.reduce(
    (sum, item) => sum + item.physicalStockKg * item.costPerKg,
    0
  );
  const totalBulkKg = inventory.reduce((sum, item) => sum + item.physicalStockKg, 0);
  const totalBags = inventory.reduce((sum, item) => sum + item.bagsCount, 0);
  const lowStockCount = inventory.filter(
    (i) => i.lotStatus === 'Low Stock' || i.lotStatus === 'Critical Low'
  ).length;

  const filterChips = [
    { id: 'All Rice', label: `All Rice [${inventory.length}]` },
    { id: 'Basmati', label: 'Super Basmati' },
    { id: 'Kainat', label: 'Kainat 1121' },
    { id: 'Sella', label: 'Sella (سیلا)' },
    { id: 'Broken', label: 'Broken / Tota (ٹوٹا)' },
    { id: 'LowStock', label: `Low Stock Only [${lowStockCount}]` }
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.varietyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.urduName.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'Basmati') matchesFilter = item.category.includes('Basmati');
    if (selectedFilter === 'Kainat') matchesFilter = item.category.includes('Long Grain');
    if (selectedFilter === 'Sella') matchesFilter = item.category.includes('Sella');
    if (selectedFilter === 'Broken') matchesFilter = item.category.includes('Broken');
    if (selectedFilter === 'LowStock') {
      matchesFilter = item.lotStatus === 'Low Stock' || item.lotStatus === 'Critical Low';
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-3">
      {/* Top Banner & Quick Inward Action */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInwardItem(inventory[0])}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Stock Inward (آمد گودام)</span>
          </button>
          <button
            onClick={() => setIsAddVarietyOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>+ Add New Variety (نیا چاول جنس)</span>
          </button>
          <button 
            onClick={() => setIsMandiChitOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Mandi Stock Chit [Alt+P]</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono-num text-slate-600">
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            • MANDI YARD INWARD ACTIVE
          </span>
          <span className="text-slate-400">|</span>
          <span>
            TARE DEDUCTION RULE: Jute 50kg Bori (-0.95kg) | PP Bag (-0.12kg)
          </span>
        </div>
      </div>

      {/* 4 Stat Cards from Image 4 */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          title="VARIETIES TRACKED"
          urduTitle="اجناس لسٹ"
          value={`${inventory.length} Active Lots`}
          subValue={`${inventory.length - lowStockCount} Normal • ${lowStockCount} Critical/Low Stock`}
          badge={`SKU: ${inventory.length}`}
          badgeColor="emerald"
          icon={Boxes}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-800"
        />

        <StatCard
          title="TOTAL STOCK VALUATION"
          urduTitle="کل مالیت گودام"
          value={`PKR ${Math.round(totalValuation).toLocaleString()}`}
          subValue={`Bulk Weight: ${totalBulkKg.toLocaleString()} kg (~${totalBags} Bori)`}
          badge="Cost Value"
          badgeColor="blue"
          icon={BadgeDollarSign}
          iconBg="bg-blue-100"
          iconColor="text-blue-800"
        />

        <StatCard
          title="THRESHOLD ALERTS"
          urduTitle="سٹاک وارننگ"
          value={`${String(lowStockCount).padStart(2, '0')} Varieties`}
          subValue={lowStockCount > 0 ? "Requires Mandi Inward Order" : "All stocks healthy"}
          badge={`${lowStockCount} Urgent`}
          badgeColor={lowStockCount > 0 ? "red" : "emerald"}
          icon={AlertTriangle}
          iconBg="bg-red-100"
          iconColor="text-red-800"
        />

        <StatCard
          title="MANDI QUALITY INDEX"
          urduTitle="معیار نمی"
          value="11.4% Avg"
          subValue="Moisture Safe < 12.5% • Grain Aeration Running"
          badge="Graded"
          badgeColor="emerald"
          icon={Droplets}
          iconBg="bg-amber-100"
          iconColor="text-amber-800"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rice variety (e.g. Kainat, Basmati, کائنات, Super Kernel), SKU code, or Moisture... [F3]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                selectedFilter === chip.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Godown Table */}
      <InventoryTable
        inventory={filteredInventory}
        onOpenInward={(item) => setInwardItem(item)}
        onOpenRateEdit={(item) => setRateEditItem(item)}
        onDeleteItem={(id) => deleteInventoryItem(id)}
      />

      {/* Bottom Godown Warehouse Status Cards */}
      <GodownStats />

      {/* Modals */}
      <StockInwardModal item={inwardItem} onClose={() => setInwardItem(null)} />
      <EditVarietyModal
        item={rateEditItem}
        onClose={() => setRateEditItem(null)}
        onDelete={(id) => deleteInventoryItem(id)}
      />
      <AddVarietyModal
        isOpen={isAddVarietyOpen}
        onClose={() => setIsAddVarietyOpen(false)}
      />
    </div>
  );
};
