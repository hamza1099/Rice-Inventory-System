// Centralized Date & Time Utility for Bukhari Rice Traders (PKT / Asia/Karachi)

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

/**
 * Returns YYYY-MM-DD in Pakistan Standard Time (PKT, UTC+5)
 */
export const getPakistanDateIso = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

/**
 * Returns formatted date string like '17 Nov 2026' in Pakistan Standard Time
 */
export const getPakistanDateStr = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
};

/**
 * Returns formatted time string like '18:10:06 PKT' in Pakistan Standard Time
 */
export const getPakistanTimeStr = (date: Date = new Date()): string => {
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
    return `${formatted} PKT`;
  } catch {
    const hrs = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    const secs = String(date.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs} PKT`;
  }
};

/**
 * Normalizes any date string (e.g. '17 Nov 2026', '16 Nov 2026', '2026-11-17')
 * into a standard YYYY-MM-DD string without timezone skew.
 */
export const parseDateStrToIso = (dStr: string): string => {
  if (!dStr) return '';
  const trimmed = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parts = trimmed.replace(/,/g, '').split(/[\s\-\/]+/);
  if (parts.length >= 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    if (day.length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }

    const monthNum = MONTH_MAP[month.slice(0, 3).toLowerCase()] || String(month).padStart(2, '0');
    return `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
  }
  return '';
};

/**
 * Formats YYYY-MM-DD into '17 Nov 2026'
 */
export const formatIsoToHuman = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const mName = MONTH_NAMES[monthIdx] || parts[1];
  return `${day} ${mName} ${year}`;
};
