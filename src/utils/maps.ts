/**
 * Maps & Location Utility Helpers
 * Supports opening Google Maps in a new tab, copying, and parsing addresses/links
 */

export function parsePastedAddressOrMapLink(raw: string): string {
  if (!raw) return '';
  let trimmed = raw.trim();

  // Strip enclosing quotes or brackets
  trimmed = trimmed.replace(/^["'\[(]+|["'\])]+$/g, '').trim();

  // Handle Google Maps place URL:
  // e.g. https://www.google.com/maps/place/Khyber+Shinwari/@33.6842318,73.0476295,17z/...
  if (trimmed.includes('google.com/maps/place/')) {
    try {
      const match = trimmed.match(/\/place\/([^/@?#]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1].replace(/\+/g, ' '));
        return decoded;
      }
    } catch (_) {}
  }

  // Handle Google Maps search / query URL:
  // e.g. https://www.google.com/maps?q=Khyber+Shinwari+Islamabad
  if (trimmed.includes('google.com/maps') && (trimmed.includes('q=') || trimmed.includes('query='))) {
    try {
      const url = new URL(trimmed);
      const q = url.searchParams.get('q') || url.searchParams.get('query');
      if (q) return decodeURIComponent(q.replace(/\+/g, ' '));
    } catch (_) {}
  }

  // Handle Google Maps share link (e.g. https://maps.app.goo.gl/...)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    return trimmed;
  }

  // Return clean plain text address
  return trimmed;
}

export function openGoogleMapsSearchTab(query?: string): void {
  const trimmed = (query || '').trim();
  const url = trimmed
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
    : `https://www.google.com/maps`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function readAddressFromClipboard(): Promise<string | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        return parsePastedAddressOrMapLink(text);
      }
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
  }
  return null;
}
