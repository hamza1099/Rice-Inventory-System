import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { ProductCard } from '../components/pos/ProductCard';
import { CashMemoBill } from '../components/pos/CashMemoBill';
import { WeightEntryModal } from '../components/pos/WeightEntryModal';
import { ReceiptPrintModal } from '../components/pos/ReceiptPrintModal';
import { CashDrawerOpeningModal } from '../components/pos/CashDrawerOpeningModal';
import { Search, Filter, Banknote, AlertTriangle, PlayCircle } from 'lucide-react';

export const PosCounterScreen: React.FC = () => {
  const {
    products,
    language,
    isDrawerOpen,
    isDayClosed,
    openingFloat,
    setIsOpeningModalOpen,
    startNewDay
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Automatically prompt for opening cash if drawer is not active for the day
  useEffect(() => {
    if (!isDrawerOpen && !isDayClosed) {
      setIsOpeningModalOpen(true);
    }
  }, [isDrawerOpen, isDayClosed, setIsOpeningModalOpen]);

  const categories = [
    { id: 'All', en: 'All Items', ur: 'سب اشیاء' },
    { id: 'Rice', en: 'Rice', ur: 'چاول' },
    { id: 'Pulses', en: 'Pulses / Daal', ur: 'دالیں' },
    { id: 'Spices', en: 'Spices', ur: 'کھلا مصالحہ' },
    { id: 'Shan & National', en: 'Shan & National', ur: 'ڈبہ مصالحہ' },
    { id: 'Oil & Ghee', en: 'Oil & Ghee', ur: 'تیل و گھی' },
    { id: 'Atta & Sugar', en: 'Atta & Sugar', ur: 'آٹا و چینی' }
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
      {/* Main 2-Column POS Layout */}
      <div className="flex-1 flex gap-2.5 min-h-0 overflow-hidden items-stretch">
        {/* Left Column: Catalog */}
        <div className="flex-1 min-w-0 flex flex-col h-full space-y-2 overflow-hidden">
          {/* Search & Category Filter Chips */}
          <div className="shrink-0 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder={
                    language === 'ur'
                      ? 'یہاں چاول، دال، مصالحہ یا SKU تلاش کریں...'
                      : 'Search grain, daal, spices, SKU or barcode here...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-400/80 focus:border-emerald-700 focus:bg-white rounded-lg text-xs font-semibold text-slate-900 placeholder-emerald-800/60 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
                <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5 pointer-events-none group-focus-within:text-emerald-800 group-focus-within:scale-110 transition-all" />
              </div>
              <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-bold rounded-lg border border-slate-300 hover:border-emerald-300 text-xs transition-all shadow-2xs cursor-pointer">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'ur' ? 'فلٹر' : 'Filter'}</span>
              </button>

              {/* Cash Drawer Opening Button */}
              <button
                type="button"
                onClick={() => setIsOpeningModalOpen(true)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-bold font-mono-num transition-all shadow-2xs cursor-pointer shrink-0 ${
                  isDrawerOpen
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 animate-pulse'
                }`}
                title={language === 'ur' ? 'گلے کا اوپننگ کیش درج یا تبدیل کریں' : 'Click to view or edit Opening Cash Float'}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-sans text-[11px] text-slate-600">
                  {language === 'ur' ? 'گلہ:' : 'Ghala:'}
                </span>
                <span>
                  {isDrawerOpen
                    ? `PKR ${openingFloat.toLocaleString()}`
                    : (language === 'ur' ? 'اوپن کریں' : 'Open')}
                </span>
              </button>
            </div>

            {/* Categories Horizontal Scroll Chips (Single Language) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    language === 'ur' ? 'font-urdu font-semibold' : ''
                  } ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Day Closed Alert Banner */}
          {isDayClosed && (
            <div className="shrink-0 bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-amber-950">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <p className="font-bold text-xs">
                    {language === 'ur'
                      ? 'سابقہ دن کا اختتام مکمل ہو چکا ہے اور رجسٹر بند ہے۔'
                      : 'Previous session Day-End Closing is sealed.'}
                  </p>
                  <p className="text-[10px] text-amber-800">
                    {language === 'ur'
                      ? 'نئی سیلز اور گلہ اوپن کرنے کے لیے "نیا دن شروع کریں" پر کلک کریں۔'
                      : 'Click to start a fresh business day & enter starting cash.'}
                  </p>
                </div>
              </div>
              <button
                onClick={startNewDay}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'نیا دن شروع کریں' : 'Start New Day'}</span>
              </button>
            </div>
          )}

          {/* Drawer Closed Banner */}
          {!isDrawerOpen && !isDayClosed && (
            <div
              onClick={() => setIsOpeningModalOpen(true)}
              className="shrink-0 bg-amber-50 border border-amber-300 hover:bg-amber-100/80 rounded-xl px-3 py-2 flex items-center justify-between text-amber-900 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold text-xs">
                  {language === 'ur'
                    ? 'کاؤنٹر گلہ ابھی اوپن نہیں ہوا • صبح کا اوپننگ کیش درج کرنے کے لیے یہاں کلک کریں'
                    : 'Cash Drawer is not opened yet • Click here to enter starting morning cash'}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-amber-700 text-white font-bold text-[10px] rounded-lg">
                {language === 'ur' ? 'اوپن کریں' : 'Open Drawer'}
              </span>
            </div>
          )}

          {/* Product Cards Grid: ONLY THIS CONTAINER SCROLLS! ("mid wala card khali scrol hona chahya") */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 auto-rows-max pb-1">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="font-bold text-xs">
                  {language === 'ur' ? 'کوئی پروڈکٹ نہیں ملا' : 'No products found matching filter.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'ur' ? 'فلٹر یا تلاش کے الفاظ تبدیل کریں' : 'Change search keyword or category filter.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cash Memo & Checkout */}
        <div className="w-[325px] 2xl:w-[350px] shrink-0 h-full min-h-0 flex flex-col overflow-hidden">
          <CashMemoBill />
        </div>
      </div>

      {/* Popups / Modals */}
      <WeightEntryModal />
      <ReceiptPrintModal />
      <CashDrawerOpeningModal />
    </div>
  );
};
