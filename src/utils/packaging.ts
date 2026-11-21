export type PackagingUnitType = 'kg' | 'piece' | 'liter';

export interface PackagingPreset {
  id: string;
  nameEn: string;
  nameUr: string;
  unitType: PackagingUnitType;
  unitsPerPack: number;
  packLabelEn: string;
  packLabelUr: string;
  unitLabelEn: string;
  unitLabelUr: string;
  tareDefault: number;
  group: 'bag' | 'carton' | 'liquid' | 'single' | 'custom';
}

export const PACKAGING_PRESETS: PackagingPreset[] = [
  // Bags & Sacks (Rice, Pulses, Sugar, Flour)
  {
    id: '25 kg PP Bag',
    nameEn: '25 kg PP Bag',
    nameUr: '25 کلو پی پی بوری',
    unitType: 'kg',
    unitsPerPack: 25,
    packLabelEn: 'Bags',
    packLabelUr: 'بوریاں',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.12,
    group: 'bag'
  },
  {
    id: '50 kg Jute Bag',
    nameEn: '50 kg Jute Bag',
    nameUr: '50 کلو جوٹ بوری',
    unitType: 'kg',
    unitsPerPack: 50,
    packLabelEn: 'Bags',
    packLabelUr: 'بوریاں',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.95,
    group: 'bag'
  },
  {
    id: '40 kg Maan Bag',
    nameEn: '40 kg (1 Maan)',
    nameUr: '40 کلو (1 من پکا)',
    unitType: 'kg',
    unitsPerPack: 40,
    packLabelEn: 'Maan',
    packLabelUr: 'من',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.85,
    group: 'bag'
  },
  {
    id: '10 kg Bag',
    nameEn: '10 kg Bag / Sack',
    nameUr: '10 کلو بیگ / تھیلا',
    unitType: 'kg',
    unitsPerPack: 10,
    packLabelEn: 'Bags',
    packLabelUr: 'تھیلے',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.08,
    group: 'bag'
  },
  {
    id: '5 kg Pack',
    nameEn: '5 kg Pack',
    nameUr: '5 کلو پیکٹ',
    unitType: 'kg',
    unitsPerPack: 5,
    packLabelEn: 'Packs',
    packLabelUr: 'پیکٹ',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.04,
    group: 'bag'
  },
  {
    id: '1 kg Pack',
    nameEn: '1 kg Pack',
    nameUr: '1 کلو پیکٹ',
    unitType: 'kg',
    unitsPerPack: 1,
    packLabelEn: 'Packs',
    packLabelUr: 'پیکٹ',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.01,
    group: 'bag'
  },

  // Cartons & Boxes (Ghee, Oil, Ketchup, Shan & National, FMCG)
  {
    id: 'Carton (16 Pieces)',
    nameEn: 'Carton - 16 Pieces (e.g. Ghee Pouches)',
    nameUr: 'کارٹن - 16 دانے (گھی / آئل / ڈبے)',
    unitType: 'piece',
    unitsPerPack: 16,
    packLabelEn: 'Cartons',
    packLabelUr: 'کارٹن',
    unitLabelEn: 'Pieces',
    unitLabelUr: 'دانے',
    tareDefault: 0.0,
    group: 'carton'
  },
  {
    id: 'Carton (12 Pieces / 1 Dozen)',
    nameEn: 'Carton - 12 Pieces (1 Dozen / Ketchup)',
    nameUr: 'کارٹن - 12 دانے (1 درجن / کیچپ)',
    unitType: 'piece',
    unitsPerPack: 12,
    packLabelEn: 'Cartons',
    packLabelUr: 'کارٹن',
    unitLabelEn: 'Pieces',
    unitLabelUr: 'دانے',
    tareDefault: 0.0,
    group: 'carton'
  },
  {
    id: 'Carton (24 Pieces)',
    nameEn: 'Carton - 24 Pieces (Bulk)',
    nameUr: 'کارٹن - 24 دانے (تھوک پیک)',
    unitType: 'piece',
    unitsPerPack: 24,
    packLabelEn: 'Cartons',
    packLabelUr: 'کارٹن',
    unitLabelEn: 'Pieces',
    unitLabelUr: 'دانے',
    tareDefault: 0.0,
    group: 'carton'
  },
  {
    id: 'Carton (6 Pieces / Half Dozen)',
    nameEn: 'Carton - 6 Pieces (Half Dozen)',
    nameUr: 'کارٹن - 6 دانے (نصف درجن)',
    unitType: 'piece',
    unitsPerPack: 6,
    packLabelEn: 'Cartons',
    packLabelUr: 'کارٹن',
    unitLabelEn: 'Pieces',
    unitLabelUr: 'دانے',
    tareDefault: 0.0,
    group: 'carton'
  },

  // Liquids (Oil & Ghee by Litres / Cans / Tins)
  {
    id: 'Tin (16 Litre Tin)',
    nameEn: 'Tin - 16 Litre Ghee Tin',
    nameUr: '16 لیٹر گھی کنستر / ٹن',
    unitType: 'liter',
    unitsPerPack: 16,
    packLabelEn: 'Tins',
    packLabelUr: 'ٹن',
    unitLabelEn: 'Litres',
    unitLabelUr: 'لیٹر',
    tareDefault: 0.0,
    group: 'liquid'
  },
  {
    id: 'Can (10 Litre Can)',
    nameEn: 'Can - 10 Litre Oil Can',
    nameUr: '10 لیٹر آئل کین',
    unitType: 'liter',
    unitsPerPack: 10,
    packLabelEn: 'Cans',
    packLabelUr: 'کین',
    unitLabelEn: 'Litres',
    unitLabelUr: 'لیٹر',
    tareDefault: 0.0,
    group: 'liquid'
  },
  {
    id: 'Can (5 Litre Can)',
    nameEn: 'Can - 5 Litre Oil Can',
    nameUr: '5 لیٹر آئل کین',
    unitType: 'liter',
    unitsPerPack: 5,
    packLabelEn: 'Cans',
    packLabelUr: 'کین',
    unitLabelEn: 'Litres',
    unitLabelUr: 'لیٹر',
    tareDefault: 0.0,
    group: 'liquid'
  },

  // Single Items / Retail
  {
    id: 'Single Piece / Bottle',
    nameEn: 'Single Piece / Bottle / Packet',
    nameUr: 'فی عدد / دانہ / بوتل / کھلا',
    unitType: 'piece',
    unitsPerPack: 1,
    packLabelEn: 'Pieces',
    packLabelUr: 'دانے',
    unitLabelEn: 'Piece',
    unitLabelUr: 'عدد',
    tareDefault: 0.0,
    group: 'single'
  },

  // Custom Options
  {
    id: 'loose_minor',
    nameEn: 'Loose / Minor Item (Grams / KG - No Bags)',
    nameUr: 'کھلا مائنر آئٹم (گرام / کلو - بغیر بوری)',
    unitType: 'kg',
    unitsPerPack: 1,
    packLabelEn: 'Loose',
    packLabelUr: 'کھلا',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.0,
    group: 'custom'
  },
  {
    id: 'custom_kg',
    nameEn: 'Custom KG per Bag / Pack...',
    nameUr: 'مرضی کا وزن (کلو گرام)...',
    unitType: 'kg',
    unitsPerPack: 25,
    packLabelEn: 'Bags',
    packLabelUr: 'بوریاں',
    unitLabelEn: 'KG',
    unitLabelUr: 'کلو',
    tareDefault: 0.1,
    group: 'custom'
  },
  {
    id: 'custom_carton',
    nameEn: 'Custom Pieces per Carton...',
    nameUr: 'مرضی کے دانے فی کارٹن...',
    unitType: 'piece',
    unitsPerPack: 12,
    packLabelEn: 'Cartons',
    packLabelUr: 'کارٹن',
    unitLabelEn: 'Pieces',
    unitLabelUr: 'دانے',
    tareDefault: 0.0,
    group: 'custom'
  },
  {
    id: 'custom_liquid',
    nameEn: 'Custom Litres per Can / Tin...',
    nameUr: 'مرضی کے لیٹر فی کین / ٹن...',
    unitType: 'liter',
    unitsPerPack: 5,
    packLabelEn: 'Cans',
    packLabelUr: 'کین',
    unitLabelEn: 'Litres',
    unitLabelUr: 'لیٹر',
    tareDefault: 0.0,
    group: 'custom'
  }
];

export const getPackagingPreset = (id: string): PackagingPreset => {
  const found = PACKAGING_PRESETS.find((p) => p.id === id);
  if (found) return found;

  const low = (id || '').toLowerCase();
  if (low.includes('loose') || low.includes('minor') || low.includes('badam') || low.includes('کھلا') || low.includes('بغیر بوری') || low.includes('gram') || low.includes('گرام')) {
    const loosePreset = PACKAGING_PRESETS.find((p) => p.id === 'loose_minor');
    if (loosePreset) return loosePreset;
  }
  if (low.includes('50 kg') || low.includes('50kg')) return PACKAGING_PRESETS[1];
  if (low.includes('40 kg') || low.includes('40kg') || low.includes('maan') || low.includes('من')) return PACKAGING_PRESETS[2];
  if (low.includes('10 kg') || low.includes('10kg')) return PACKAGING_PRESETS[3];
  if (low.includes('5 kg') || low.includes('5kg')) return PACKAGING_PRESETS[4];
  if (low.includes('1 kg') || low.includes('1kg')) return PACKAGING_PRESETS[5];
  if (low.includes('16') && (low.includes('piece') || low.includes('carton') || low.includes('دانے')))
    return PACKAGING_PRESETS[6];
  if (low.includes('12') || low.includes('dozen') || low.includes('درجن')) return PACKAGING_PRESETS[7];
  if (low.includes('24')) return PACKAGING_PRESETS[8];
  if (low.includes('6') && (low.includes('carton') || low.includes('piece'))) return PACKAGING_PRESETS[9];
  if (low.includes('tin') || low.includes('ٹن')) return PACKAGING_PRESETS[10];
  if (low.includes('can') || low.includes('کین')) return PACKAGING_PRESETS[12];
  if (low.includes('single') || low.includes('piece') || low.includes('عدد') || low.includes('bottle'))
    return PACKAGING_PRESETS[13];

  // Default to 25 kg PP Bag
  return PACKAGING_PRESETS[0];
};

export const getDefaultPackagingForCategory = (category: string): PackagingPreset => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('oil') || cat.includes('ghee') || cat.includes('تیل') || cat.includes('گھی')) {
    // Carton of 16 Pieces (Ghee)
    return PACKAGING_PRESETS.find((p) => p.id === 'Carton (16 Pieces)') || PACKAGING_PRESETS[6];
  }
  if (cat.includes('shan') || cat.includes('national') || cat.includes('ڈبہ')) {
    // 1 Dozen / 12 Pieces
    return PACKAGING_PRESETS.find((p) => p.id === 'Carton (12 Pieces / 1 Dozen)') || PACKAGING_PRESETS[7];
  }
  if (cat.includes('spice') || cat.includes('masala') || cat.includes('مصالحہ')) {
    return PACKAGING_PRESETS.find((p) => p.id === '1 kg Pack') || PACKAGING_PRESETS[5];
  }
  if (cat.includes('dry') || cat.includes('fruit') || cat.includes('میوہ') || cat.includes('badam')) {
    return PACKAGING_PRESETS.find((p) => p.id === 'loose_minor') || PACKAGING_PRESETS[0];
  }
  // Rice / Pulses / Atta / Sugar default to 25 kg PP Bag
  return PACKAGING_PRESETS[0];
};

export const getCategorySkuPrefix = (category: string, nextIndex: number = 1): string => {
  const c = (category || '').toLowerCase();
  let prefix = 'SKU-RICE';
  if (c.includes('pulse') || c.includes('daal') || c.includes('دال')) {
    prefix = 'SKU-DAAL';
  } else if (c.includes('oil') || c.includes('ghee') || c.includes('گھی') || c.includes('تیل')) {
    prefix = 'SKU-GHEE';
  } else if (c.includes('spice') || c.includes('masala') || c.includes('مصالحہ')) {
    prefix = 'SKU-SPICE';
  } else if (c.includes('dry') || c.includes('fruit') || c.includes('میوہ') || c.includes('badam')) {
    prefix = 'SKU-DRYFRUIT';
  } else if (c.includes('shan') || c.includes('national')) {
    prefix = 'SKU-SHAN';
  } else if (c.includes('atta') || c.includes('flour') || c.includes('sugar') || c.includes('چینی') || c.includes('آٹا')) {
    prefix = 'SKU-ATTA';
  } else if (c.includes('rice') || c.includes('چاول') || c.includes('kainat') || c.includes('basmati') || c.includes('sella') || c.includes('tota')) {
    prefix = 'SKU-RICE';
  } else {
    prefix = 'SKU-GEN';
  }
  return `${prefix}-${String(nextIndex).padStart(2, '0')}`;
};
