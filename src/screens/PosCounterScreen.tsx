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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Rice');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'All Rice', label: 'All Rice (سب چاول)' },
    { id: 'Basmati Varieties', label: 'Basmati Varieties' },
    { id: 'Kainat / Long Grain', label: 'Kainat / Long Grain' },
    { id: 'Sella Rice', label: 'Sella Rice' },
    { id: 'Broken / Tota', label: 'Broken / Tota' }
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All Rice' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.urduName.includes(searchQuery) ||
      p.shortcut.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Top Quick Status Bar (Exact from Image 3) */}
      <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 shadow-xs flex items-center justify-between text-xs flex-wrap gap-2">
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
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column: Catalog & Scale Terminal */}
        <div className="col-span-8 space-y-3">
          {/* Search & Category Filter Chips */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type Grain SKU, Urdu Name (e.g. سوپر باسمتی) or [F1 / /]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-xs">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (6 varieties matching Image 3) */}
          <div className="grid grid-cols-3 gap-2.5">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {/* Integrated Heavy Scale Terminal (Bottom Left) */}
          <ScaleTerminal />
        </div>

        {/* Right Column: Cash Memo & Checkout */}
        <div className="col-span-4 sticky top-14">
          <CashMemoBill />
        </div>
      </div>

      {/* Popups / Modals */}
      <WeightEntryModal />
      <ReceiptPrintModal />
    </div>
  );
};
