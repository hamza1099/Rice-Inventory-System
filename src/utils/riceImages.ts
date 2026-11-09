// Default Rice Sample Images & SVG Fallbacks
export const DEFAULT_RICE_IMAGE =
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';

export interface RiceImagePreset {
  id: string;
  name: string;
  urduName: string;
  imageUrl: string;
}

export const SAMPLE_RICE_PRESETS: RiceImagePreset[] = [
  {
    id: 'preset-basmati',
    name: 'Super Basmati (White Grain)',
    urduName: 'سوپر باسمتی سفید دانا',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-kainat',
    name: 'Kainat 1121 Steam (Long Grain)',
    urduName: 'کائنات ۱۱۲۱ سٹیم لمبا دانا',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-kernel',
    name: 'Super Kernel Vintage (Aged)',
    urduName: 'سوپر کرنل نایاب پرانا',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-sella',
    name: 'Golden Sella (Parboiled)',
    urduName: 'سیلا گولڈن باسمتی',
    imageUrl: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-tota',
    name: 'White Broken / Tota',
    urduName: 'سفید ٹوٹا چاول',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-bori',
    name: '50kg Jute Bori (Burlap Sack)',
    urduName: '۵۰ کلو جوٹ بوری سٹا ک',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-brown',
    name: 'Brown Parboiled / Organic',
    urduName: 'براؤن چاول خالص',
    imageUrl: 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=400&q=80'
  }
];

// Offline SVG Fallback Data URI in case network is down
export const SVG_RICE_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><path d="M50 20 C65 20 80 40 80 60 C80 75 65 85 50 85 C35 85 20 75 20 60 C20 40 35 20 50 20 Z" fill="%23e2e8f0"/><ellipse cx="50" cy="52" rx="18" ry="32" fill="%23cbd5e1"/><ellipse cx="45" cy="50" rx="14" ry="28" fill="%23ffffff" opacity="0.7"/></svg>';
