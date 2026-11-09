import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { ProductCard } from '../components/pos/ProductCard';
import { ScaleTerminal } from '../components/pos/ScaleTerminal';
import { CashMemoBill } from '../components/pos/CashMemoBill';
import { WeightEntryModal } from '../components/pos/WeightEntryModal';
import { ReceiptPrintModal } from '../components/pos/ReceiptPrintModal';
import { Search, Filter, ShieldCheck, Cpu } from 'lucide-react';

export const PosCounterScreen: React.FC = () => {
  const { products } = usePos();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'All', label: 'All Items (سب اشیاء)' },
    { id: 'Rice', label: 'Rice (چاول)' },
    { id: 'Pulses', label: 'Pulses / Daal (دالیں)' },
    { id: 'Spices', label: 'Spices (کھلا مصالحہ)' },
    { id: 'Shan & National', label: 'Shan & National (ڈبہ مصالحہ)' },
    { id: 'Oil & Ghee', label: 'Oil & Ghee (تیل و گھی)' },
    { id: 'Atta & Sugar', label: 'Atta & Sugar (آٹا و چینی)' }
  ];

  const filteredProducts = products.filter((p) => {
    let matchesCat = true;
    if (selectedCategory !== 'All') {
      const catLower = (p.category || '').toLowerCase();
      const selLower = selectedCategory.toLowerCase();
      if (selectedCategory === 'Rice') {
        matchesCat = catLower.includes('rice') || catLower.includes('چاول') || catLower.includes('basmati') || catLower.includes('kainat') || catLower.includes('sella');
      } else if (selectedCategory === 'Pulses') {
        matchesCat = catLower.includes('pulse') || catLower.includes('daal') || catLower.includes('دال');
      } else if (selectedCategory === 'Spices') {
        matchesCat = catLower.includes('spice') || catLower.includes('کھلا مصالحہ');
      } else if (selectedCategory === 'Shan & National') {
        matchesCat = catLower.includes('shan') || catLower.includes('national') || catLower.includes('ڈبہ') || (p.brand && (p.brand.includes('Shan') || p.brand.includes('National')));
      } else if (selectedCategory === 'Oil & Ghee') {
        matchesCat = catLower.includes('oil') || catLower.includes('ghee') || catLower.includes('تیل');
      } else if (selectedCategory === 'Atta & Sugar') {
        matchesCat = catLower.includes('atta') || catLower.includes('sugar') || catLower.includes('آٹا') || catLower.includes('چینی');
      } else {
        matchesCat = catLower.includes(selLower);
      }
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.urduName.includes(q) ||
      p.shortcut.toLowerCase().includes(q) ||
      p.badgeLabel.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.binLocation.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col space-y-2 overflow-hidden">
      {/* Top Quick Status Bar */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 shadow-2xs flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[11px]">
            <Cpu className="w-3 h-3 text-emerald-700" />
            <span>SCALE COM1: CONNECTED</span>
          </span>

          <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Strict Cash/Raast Counter</span>
            <span className="urdu-text text-slate-500 font-bold" dir="rtl">
              (فوری نقد اور راست ادائیگی - ادھار مکمل بند ہے)
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="flex-1 grid grid-cols-12 gap-2.5 min-h-0 overflow-hidden items-stretch">
        {/* Left Column: Catalog & Scale Terminal */}
        <div className="col-span-8 flex flex-col h-full min-h-0 space-y-2 overflow-hidden">
          {/* Search & Category Filter Chips */}
          <div className="shrink-0 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type Grain, Daal, Shan, National SKU or Urdu Name (e.g. زیرہ، بمبئی بریانی) or [F1 / /]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-xs cursor-pointer">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Categories Horizontal Scroll Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid: ONLY THIS CONTAINER SCROLLS! ("mid wala card khali scrol hona chahya") */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2 auto-rows-max pb-1">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="font-bold text-xs">No products found matching filter.</p>
                <p className="text-[11px] text-slate-400 mt-1">کوئی آئٹم نہیں ملا - فلٹر تبدیل کریں</p>
              </div>
            )}
          </div>

          {/* Integrated Heavy Scale Terminal (Bottom Left - Fixed at bottom) */}
          <div className="shrink-0">
            <ScaleTerminal />
          </div>
        </div>

        {/* Right Column: Cash Memo & Checkout */}
        <div className="col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
          <CashMemoBill />
        </div>
      </div>

      {/* Popups / Modals */}
      <WeightEntryModal />
      <ReceiptPrintModal />
    </div>
  );
};
