export interface TerminalOption {
  id: string;
  en: string;
  ur: string;
}

export const DEFAULT_TERMINAL_OPTIONS: TerminalOption[] = [
  {
    id: 'Terminal #01 (Counter 01)',
    en: 'Terminal #01 (Counter 01)',
    ur: 'ٹرمینل #01 (کاؤنٹر 01)'
  }
];

const STORAGE_KEY = 'ricecms_custom_terminals';

export const getCustomTerminals = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomTerminal = (name: string): string[] => {
  const trimmed = name.trim();
  if (!trimmed) return getCustomTerminals();

  const current = getCustomTerminals();
  const existsInDefault = DEFAULT_TERMINAL_OPTIONS.some(
    (t) => t.id.toLowerCase() === trimmed.toLowerCase() || t.en.toLowerCase() === trimmed.toLowerCase()
  );

  if (!existsInDefault && !current.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom terminal', e);
    }
    return updated;
  }
  return current;
};

export const deleteCustomTerminal = (name: string): string[] => {
  const current = getCustomTerminals();
  const updated = current.filter((t) => t !== name);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom terminal', e);
  }
  return updated;
};
