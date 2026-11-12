import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { StatCard } from '../components/common/StatCard';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { StockInwardModal } from '../components/inventory/StockInwardModal';
import { EditVarietyModal } from '../components/inventory/EditVarietyModal';
import { AddVarietyModal } from '../components/inventory/AddVarietyModal';
import type { InventoryItem } from '../types';
import {
  Boxes,
  BadgeDollarSign,
  AlertTriangle,
  Plus,
  FileText,
  Search,
  PlusCircle
} from 'lucide-react';

export const StockInventoryScreen: React.FC = () => {
  const { inventory, setIsMandiChitOpen, deleteInventoryItem, language } = usePos();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [inwardItem, setInwardItem] = useState<InventoryItem | null>(null);
  const [isInwardOpen, setIsInwardOpen] = useState<boolean>(false);
  const [rateEditItem, setRateEditItem] = useState<InventoryItem | null>(null);
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState<boolean>(false);

  const isUr = language === 'ur';

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
    { id: 'All', label: isUr ? `سب اشیاء [${inventory.length}]` : `All Items [${inventory.length}]` },
    { id: 'Rice', label: isUr ? 'چاول' : 'Rice' },
    { id: 'Pulses', label: isUr ? 'دالیں' : 'Pulses / Daal' },
    { id: 'Spices', label: isUr ? 'کھلا مصالحہ' : 'Spices' },
    { id: 'Packaged', label: isUr ? 'ڈبہ مصالحہ' : 'Shan & National' },
    { id: 'Oil', label: isUr ? 'تیل و گھی' : 'Oil & Ghee' },
    { id: 'AttaSugar', label: isUr ? 'آٹا و چینی' : 'Atta & Sugar' },
    { id: 'LowStock', label: isUr ? `کم سٹاک [${lowStockCount}]` : `Low Stock Only [${lowStockCount}]` }
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.varietyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.urduName.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'Rice') {
      matchesFilter = item.category.includes('Rice') || item.category.includes('چاول') || item.category.includes('Basmati') || item.category.includes('Long Grain') || item.category.includes('Sella') || item.category.includes('Broken');
    } else if (selectedFilter === 'Pulses') {
      matchesFilter = item.category.includes('Pulses') || item.category.includes('Daal') || item.category.includes('دال');
    } else if (selectedFilter === 'Spices') {
      matchesFilter = item.category.includes('Spices') || item.category.includes('مصالحہ');
    } else if (selectedFilter === 'Packaged') {
      matchesFilter = item.category.includes('Shan') || item.category.includes('National') || item.category.includes('ڈبہ');
    } else if (selectedFilter === 'Oil') {
      matchesFilter = item.category.includes('Oil') || item.category.includes('Ghee');
    } else if (selectedFilter === 'AttaSugar') {
      matchesFilter = item.category.includes('Atta') || item.category.includes('Sugar');
    } else if (selectedFilter === 'LowStock') {
      matchesFilter = item.lotStatus === 'Low Stock' || item.lotStatus === 'Critical Low';
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col space-y-2 overflow-hidden min-h-0">
      {/* Top Banner & Quick Inward Action */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-xs flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setInwardItem(null); // Clean state: prompt user to select variety
              setIsInwardOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUr ? '+ گودام مال آمد' : '+ New Stock Inward'}</span>
          </button>
          <button
            onClick={() => setIsAddVarietyOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>{isUr ? '+ نئی جنس / آئٹم' : '+ Add New Item / Variety'}</span>
          </button>
          <button 
            onClick={() => setIsMandiChitOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{isUr ? 'منڈی سٹاک چٹ [Alt+P]' : 'Mandi Stock Chit [Alt+P]'}</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards (Compact Mode for maximum table visibility) */}
      <div className="shrink-0 grid grid-cols-3 gap-2">
        <StatCard
          compact
          title="VARIETIES TRACKED"
          urduTitle="اجناس لسٹ"
          value={`${inventory.length} Active Lots`}
          subValue={`${inventory.length - lowStockCount} Normal • ${lowStockCount} Low Stock`}
          badge={`SKU: ${inventory.length}`}
          badgeColor="emerald"
          icon={Boxes}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-800"
        />

        <StatCard
          compact
          title="TOTAL STOCK VALUATION"
          urduTitle="کل مالیت گودام"
          value={`PKR ${Math.round(totalValuation).toLocaleString()}`}
          subValue={`Bulk: ${totalBulkKg.toLocaleString()} kg (~${totalBags} Bags)`}
          badge="Cost Value"
          badgeColor="blue"
          icon={BadgeDollarSign}
          iconBg="bg-blue-100"
          iconColor="text-blue-800"
        />

        <StatCard
          compact
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
      </div>

      {/* Search & Filter Bar with High-Contrast Search Input */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-lg p-2 shadow-xs space-y-1.5">
        <div className="relative group">
          <input
            type="text"
            placeholder={
              isUr
                ? 'یہاں چاول، جنس، دال یا SKU کوڈ تلاش کریں...'
                : 'Search rice variety, grain SKU, category or code here...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-500/80 focus:border-emerald-700 focus:bg-white rounded-lg text-xs font-semibold text-slate-900 placeholder-emerald-800/70 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 transition-all"
          />
          <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5 pointer-events-none group-focus-within:text-emerald-800 group-focus-within:scale-110 transition-all" />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
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

      {/* Live Godown Table (Takes all remaining height and scrolls internally) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <InventoryTable
          inventory={filteredInventory}
          onOpenInward={(item) => {
            setInwardItem(item);
            setIsInwardOpen(true);
          }}
          onOpenRateEdit={(item) => setRateEditItem(item)}
          onDeleteItem={(id) => deleteInventoryItem(id)}
        />
      </div>

      {/* Modals */}
      <StockInwardModal
        isOpen={isInwardOpen}
        item={inwardItem}
        onClose={() => {
          setIsInwardOpen(false);
          setInwardItem(null);
        }}
      />
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
