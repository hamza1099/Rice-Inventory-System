// Verified Product Images & Sample Presets for Rice, Daal, Spices, Shan, National, Oil, Atta

export interface ProductPreset {
  id: string;
  name: string;
  urduName: string;
  category: string;
  brand?: string;
  rate: number;
  unit: string;
  imageUrl: string;
}

// ==================== AUTHENTIC 50KG MANDI SACKS (چاول اور دالوں کی اصل بوریاں) ====================
export const BORI_BASMATI_IMAGE = '/images/rice_bori_basmati.jpg';
export const BORI_SUPER_IMAGE = '/images/rice_bori_super.jpg';
export const BORI_KAINAT_IMAGE = '/images/rice_bori_kainat.jpg';
export const BORI_SELLA_IMAGE = '/images/rice_bori_sella.jpg';
export const BORI_STACK_IMAGE = '/images/rice_bori_stack.jpg';
export const BORI_DAAL_CHANA_IMAGE = '/images/daal_chana_bori.jpg';
export const BORI_DAAL_MOONG_IMAGE = '/images/daal_moong_bori.jpg';
export const BORI_SPICES_ZEERA_IMAGE = '/images/spices_zeera_bori.jpg';
export const BORI_ATTA_WHEAT_IMAGE = '/images/atta_wheat_sack.jpg';

// Default Fallback is now the authentic 50kg Jute Bori
export const DEFAULT_RICE_IMAGE = BORI_BASMATI_IMAGE;

export const SVG_RICE_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f1f5f9"/><circle cx="100" cy="75" r="45" fill="%23065f46" opacity="0.1"/><path d="M100 40 C120 40 140 60 140 85 C140 105 120 120 100 120 C80 120 60 105 60 85 C60 60 80 40 100 40 Z" fill="%2310b981" opacity="0.6"/><ellipse cx="100" cy="80" rx="18" ry="32" fill="%23ffffff"/><text x="100" y="138" font-size="11" font-family="sans-serif" font-weight="bold" fill="%23065f46" text-anchor="middle">BUKHARI RICE</text></svg>';

// Realistic SVG Graphics for Shan & National Masala Boxes
export const SHAN_BIRYANI_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23c21807" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%23d32f2f" rx="8"/><circle cx="150" cy="50" r="32" fill="%23ffffff"/><text x="150" y="58" font-size="22" font-family="Arial, sans-serif" font-weight="900" fill="%23c21807" text-anchor="middle">Shan</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">BOMBAY BIRYANI</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%23c21807" text-anchor="middle">Recipe &amp; Seasoning Mix • 60g</text><rect x="35" y="165" width="230" height="45" fill="%23b71c1c" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffeb3b" text-anchor="middle">شان بمبئی بریانی مصالحہ</text></svg>';

export const NATIONAL_BIRYANI_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23007a3d" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%23008744" rx="8"/><circle cx="150" cy="50" r="32" fill="%23d32f2f"/><text x="150" y="57" font-size="15" font-family="Arial, sans-serif" font-weight="900" fill="%23ffffff" text-anchor="middle">National</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">SPECIAL BIRYANI</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%23007a3d" text-anchor="middle">Classic Rice Recipe Mix • 50g</text><rect x="35" y="165" width="230" height="45" fill="%23005a2b" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">نیشنل اسپیشل بریانی مصالحہ</text></svg>';

export const SHAN_TIKKA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23e64a19" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%23f4511e" rx="8"/><circle cx="150" cy="50" r="32" fill="%23ffffff"/><text x="150" y="58" font-size="22" font-family="Arial, sans-serif" font-weight="900" fill="%23c21807" text-anchor="middle">Shan</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">CHICKEN TIKKA</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%23e64a19" text-anchor="middle">BBQ Meat Seasoning • 50g</text><rect x="35" y="165" width="230" height="45" fill="%23bf360c" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffeb3b" text-anchor="middle">شان چکن تکہ مصالحہ</text></svg>';

export const NATIONAL_QORMA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23b71c1c" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%23c62828" rx="8"/><circle cx="150" cy="50" r="32" fill="%23008744"/><text x="150" y="57" font-size="15" font-family="Arial, sans-serif" font-weight="900" fill="%23ffffff" text-anchor="middle">National</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">QORMA MASALA</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%23b71c1c" text-anchor="middle">Rich Meat Curry Mix • 50g</text><rect x="35" y="165" width="230" height="45" fill="%23880e4f" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">نیشنل قورمہ مصالحہ</text></svg>';

export const SHAN_CHAAT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23f57f17" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%23fbc02d" rx="8"/><circle cx="150" cy="50" r="32" fill="%23ffffff"/><text x="150" y="58" font-size="22" font-family="Arial, sans-serif" font-weight="900" fill="%23c21807" text-anchor="middle">Shan</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">CHAAT MASALA</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%23e65100" text-anchor="middle">Seasoning Sprinkle • 100g</text><rect x="35" y="165" width="230" height="45" fill="%23e65100" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">شان چاٹ مصالحہ</text></svg>';

export const NATIONAL_NIHARI_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%234a148c" rx="12"/><rect x="15" y="15" width="270" height="210" fill="%236a1b9a" rx="8"/><circle cx="150" cy="50" r="32" fill="%23d32f2f"/><text x="150" y="57" font-size="15" font-family="Arial, sans-serif" font-weight="900" fill="%23ffffff" text-anchor="middle">National</text><rect x="35" y="95" width="230" height="55" fill="%23ffffff" rx="6"/><text x="150" y="120" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="%231b1b1b" text-anchor="middle">NIHARI MASALA</text><text x="150" y="140" font-size="12" font-family="Arial, sans-serif" font-weight="bold" fill="%234a148c" text-anchor="middle">Authentic Stew Mix • 65g</text><rect x="35" y="165" width="230" height="45" fill="%23311b92" rx="6"/><text x="150" y="192" font-size="18" font-family="sans-serif" font-weight="bold" fill="%23ffeb3b" text-anchor="middle">نیشنل نہاری مصالحہ</text></svg>';

// Preset library across all categories for quick selection during inventory entry
export const ALL_PRODUCT_PRESETS: ProductPreset[] = [
  // 1. RICE (چاول کی بوریاں)
  {
    id: 'pr-rice-basmati',
    name: 'Super Basmati Old (50kg Bori)',
    urduName: 'سوپر باسمتی چاول پرانا بوری',
    category: 'Rice (چاول)',
    rate: 380,
    unit: 'kg',
    imageUrl: BORI_BASMATI_IMAGE
  },
  {
    id: 'pr-rice-kainat',
    name: 'Kainat 1121 Steam (50kg Bori)',
    urduName: 'کائنات ۱۱۲۱ سٹیم بوری',
    category: 'Rice (چاول)',
    rate: 340,
    unit: 'kg',
    imageUrl: BORI_KAINAT_IMAGE
  },
  {
    id: 'pr-rice-super',
    name: 'Super Kernel Basmati Vintage',
    urduName: 'سوپر کرنل باسمتی نایاب بوری',
    category: 'Rice (چاول)',
    rate: 420,
    unit: 'kg',
    imageUrl: BORI_SUPER_IMAGE
  },
  {
    id: 'pr-rice-sella',
    name: 'Golden Sella Basmati (50kg Bori)',
    urduName: 'سیلا گولڈن باسمتی بوری',
    category: 'Rice (چاول)',
    rate: 360,
    unit: 'kg',
    imageUrl: BORI_SELLA_IMAGE
  },
  {
    id: 'pr-rice-tota',
    name: 'White Broken Tota (بوری)',
    urduName: 'سفید ٹوٹا چاول بوری',
    category: 'Rice (چاول)',
    rate: 210,
    unit: 'kg',
    imageUrl: BORI_BASMATI_IMAGE
  },
  {
    id: 'pr-rice-stack',
    name: '50kg Super Bori Godown Stack',
    urduName: '۵۰ کلو سوپر باسمتی بوری گودام سٹیک',
    category: 'Rice (چاول)',
    rate: 370,
    unit: 'kg',
    imageUrl: BORI_STACK_IMAGE
  },

  // 2. PULSES / DAAL (دالوں کی بوریاں)
  {
    id: 'pr-daal-chana',
    name: 'Daal Chana Special (50kg Bori)',
    urduName: 'دال چنا سپیشل واش بوری',
    category: 'Pulses / Daal (دالیں)',
    rate: 260,
    unit: 'kg',
    imageUrl: BORI_DAAL_CHANA_IMAGE
  },
  {
    id: 'pr-daal-moong',
    name: 'Daal Moong Dhooli (50kg Bori)',
    urduName: 'دال مونگ دھلی ہوئی بوری',
    category: 'Pulses / Daal (دالیں)',
    rate: 290,
    unit: 'kg',
    imageUrl: BORI_DAAL_MOONG_IMAGE
  },
  {
    id: 'pr-daal-masoor',
    name: 'Daal Masoor Red Imported',
    urduName: 'دال مسور سرخ امپورٹڈ بوری',
    category: 'Pulses / Daal (دالیں)',
    rate: 275,
    unit: 'kg',
    imageUrl: BORI_DAAL_MOONG_IMAGE
  },
  {
    id: 'pr-daal-mash',
    name: 'Daal Mash Dhooli Extra',
    urduName: 'دال ماش دھلی سپیشل بوری',
    category: 'Pulses / Daal (دالیں)',
    rate: 420,
    unit: 'kg',
    imageUrl: BORI_DAAL_CHANA_IMAGE
  },
  {
    id: 'pr-safaid-chana',
    name: 'Safaid Kabuli Chana Moata',
    urduName: 'سفید چنا کابل موٹا بوری',
    category: 'Pulses / Daal (دالیں)',
    rate: 340,
    unit: 'kg',
    imageUrl: BORI_DAAL_CHANA_IMAGE
  },

  // 3. SPICES / KHULA MASALA (کھلا مصالحہ جات)
  {
    id: 'pr-masala-zeera',
    name: 'Sabut Zeera Safaid Pure (بوری)',
    urduName: 'سفید زیرہ خالص بوری',
    category: 'Spices (کھلا مصالحہ)',
    rate: 1850,
    unit: 'kg',
    imageUrl: BORI_SPICES_ZEERA_IMAGE
  },
  {
    id: 'pr-masala-haldi',
    name: 'Haldi Powder Pure Desi',
    urduName: 'ہلدی پاؤڈر خالص دیسی',
    category: 'Spices (کھلا مصالحہ)',
    rate: 480,
    unit: 'kg',
    imageUrl: BORI_SPICES_ZEERA_IMAGE
  },
  {
    id: 'pr-masala-mirch',
    name: 'Lal Mirch Powder Pure',
    urduName: 'سرخ مرچ پسی ہوئی خالص',
    category: 'Spices (کھلا مصالحہ)',
    rate: 650,
    unit: 'kg',
    imageUrl: BORI_SPICES_ZEERA_IMAGE
  },
  {
    id: 'pr-masala-garam',
    name: 'Garam Masala Mix Whole Special',
    urduName: 'گرم مصالحہ ثابت سپیشل بوری',
    category: 'Spices (کھلا مصالحہ)',
    rate: 1400,
    unit: 'kg',
    imageUrl: BORI_SPICES_ZEERA_IMAGE
  },

  // 4. SHAN & NATIONAL (برانڈڈ ڈبہ مصالحہ جات)
  {
    id: 'pr-shan-biryani',
    name: 'Shan Bombay Biryani Masala',
    urduName: 'شان بمبئی بریانی مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'Shan Foods',
    rate: 140,
    unit: 'pkt',
    imageUrl: SHAN_BIRYANI_IMAGE
  },
  {
    id: 'pr-national-biryani',
    name: 'National Special Biryani',
    urduName: 'نیشنل اسپیشل بریانی مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'National Foods',
    rate: 140,
    unit: 'pkt',
    imageUrl: NATIONAL_BIRYANI_IMAGE
  },
  {
    id: 'pr-shan-tikka',
    name: 'Shan Chicken Tikka Masala',
    urduName: 'شان چکن تکہ مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'Shan Foods',
    rate: 135,
    unit: 'pkt',
    imageUrl: SHAN_TIKKA_IMAGE
  },
  {
    id: 'pr-national-qorma',
    name: 'National Qorma Masala',
    urduName: 'نیشنل قورمہ مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'National Foods',
    rate: 140,
    unit: 'pkt',
    imageUrl: NATIONAL_QORMA_IMAGE
  },
  {
    id: 'pr-shan-chaat',
    name: 'Shan Chaat Masala 100g',
    urduName: 'شان چاٹ مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'Shan Foods',
    rate: 160,
    unit: 'pkt',
    imageUrl: SHAN_CHAAT_IMAGE
  },
  {
    id: 'pr-national-nihari',
    name: 'National Nihari Masala',
    urduName: 'نیشنل نہاری مصالحہ',
    category: 'Shan & National (ڈبہ مصالحہ)',
    brand: 'National Foods',
    rate: 145,
    unit: 'pkt',
    imageUrl: NATIONAL_NIHARI_IMAGE
  },

  // 5. OIL, GHEE, FLOUR & SUGAR (تیل، گھی، آٹا، چینی)
  {
    id: 'pr-oil-dalda',
    name: 'Dalda Cooking Oil 5 Litre Tin',
    urduName: 'ڈالڈا کوکنگ آئل ۵ لیٹر',
    category: 'Oil & Ghee (تیل و گھی)',
    brand: 'Dalda',
    rate: 2650,
    unit: 'tin',
    imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pr-ghee-habib',
    name: 'Habib Banaspati Ghee 1kg Packet',
    urduName: 'حبیب بناسپتی گھی ۱ کلو',
    category: 'Oil & Ghee (تیل و گھی)',
    brand: 'Habib',
    rate: 510,
    unit: 'pkt',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pr-atta-chakki',
    name: 'Chakki Atta 10kg Bag (خالص آٹا بوری)',
    urduName: 'خالص دیسی چکی آٹا ۱۰ کلو تھیلا',
    category: 'Atta & Sugar (آٹا و چینی)',
    brand: 'Bukhari Flour',
    rate: 1350,
    unit: 'bag',
    imageUrl: BORI_ATTA_WHEAT_IMAGE
  },
  {
    id: 'pr-sugar-cheeni',
    name: 'Refined White Sugar 50kg Bori',
    urduName: 'سفید دانے دار چینی بوری',
    category: 'Atta & Sugar (آٹا و چینی)',
    rate: 145,
    unit: 'kg',
    imageUrl: BORI_STACK_IMAGE
  }
];
