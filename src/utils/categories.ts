export interface CategoryOption {
  id: string;
  en: string;
  ur: string;
}

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'Rice', en: 'Rice', ur: 'چاول' },
  { id: 'Pulses / Daal', en: 'Pulses / Daal', ur: 'دالیں' },
  { id: 'Spices', en: 'Spices / Masala', ur: 'کھلا مصالحہ' },
  { id: 'Shan & National', en: 'Shan & National', ur: 'ڈبہ مصالحہ' },
  { id: 'Oil & Ghee', en: 'Oil & Ghee', ur: 'تیل و گھی' },
  { id: 'Atta & Sugar', en: 'Atta & Sugar', ur: 'آٹا و چینی' },
  { id: 'Basmati Classic', en: 'Basmati Classic', ur: 'باسمتی کلاسک' },
  { id: 'Long Grain', en: 'Long Grain / Kainat 1121', ur: 'کائنات ۱۱۲۱' },
  { id: 'Sella (Parboiled)', en: 'Sella (Parboiled)', ur: 'سیلا گولڈن' },
  { id: 'Broken / Tota', en: 'Broken / Tota', ur: 'ٹوٹا کوالٹی' },
  { id: 'Other', en: 'Other', ur: 'دیگر' }
];

const STORAGE_KEY = 'ricecms_custom_categories';

export const getCustomCategories = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomCategory = (name: string): string[] => {
  const trimmed = name.trim();
  if (!trimmed) return getCustomCategories();

  const current = getCustomCategories();
  const existsInDefault = DEFAULT_CATEGORY_OPTIONS.some(
    (c) => c.id.toLowerCase() === trimmed.toLowerCase() || c.en.toLowerCase() === trimmed.toLowerCase()
  );

  if (!existsInDefault && !current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom category to localStorage', e);
    }
    return updated;
  }
  return current;
};
