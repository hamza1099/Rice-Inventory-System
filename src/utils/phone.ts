/**
 * Phone number utilities for Pakistani Mobile Networks (Jazz, Telenor, Zong, Ufone, Onic, SCO).
 * Standard Format: 03XX-XXXXXXX (11 digits)
 */

/**
 * Sanitizes and auto-formats Pakistani mobile numbers in real time.
 * - Strictly blocks all letters, symbols, and invalid characters.
 * - Handles international prefix: +923001234567, 923001234567, 00923001234567 -> 0300-1234567
 * - Auto-prepends '0' if user starts typing '3' (e.g. 3001234567 -> 0300-1234567)
 * - Auto-inserts hyphen after 4 digits: 03001234567 -> 0300-1234567
 * - Hard caps at exactly 11 digits (12 characters with hyphen).
 */
export const formatPakistaniPhone = (value: string): string => {
  if (!value) return '';

  // Strip all non-digit characters
  let digits = value.replace(/\D/g, '');

  // Handle international prefix pasted: +923XX or 923XX or 00923XX -> 03XX
  if ((digits.startsWith('923') || digits.startsWith('00923')) && digits.length >= 12) {
    digits = digits.replace(/^(0092|92)/, '0');
  }

  // If user starts typing with '3' (e.g. 300..., 322...), auto-prepend '0'
  if (digits.length > 0 && !digits.startsWith('0')) {
    if (digits.startsWith('3')) {
      digits = '0' + digits;
    }
  }

  // Strictly limit to 11 digits (Standard Pakistani mobile format)
  digits = digits.slice(0, 11);

  // Format with hyphen after 4 digits: 03XX-XXXXXXX
  if (digits.length > 4) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return digits;
};

/**
 * Validates whether the given phone number is a valid 11-digit Pakistani mobile number.
 * Valid prefix: 03XX (0300 to 0355)
 */
export const isValidPakistaniPhone = (phone: string, isRequired: boolean = false): boolean => {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return !isRequired;
  }

  const digits = trimmed.replace(/\D/g, '');
  // Must be exactly 11 digits and start with 03
  return /^03\d{9}$/.test(digits);
};

/**
 * Extracts clean 11 digits without hyphen: 03001234567
 */
export const getCleanPhoneDigits = (phone: string): string => {
  return (phone || '').replace(/\D/g, '').slice(0, 11);
};

/**
 * Converts formatted 0300-1234567 to international format 923001234567 for WhatsApp API.
 */
export const toWhatsAppPhone = (phone: string): string => {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('03')) {
    clean = '92' + clean.slice(1);
  } else if (!clean.startsWith('92') && clean.length === 10) {
    clean = '92' + clean;
  }
  return clean;
};
