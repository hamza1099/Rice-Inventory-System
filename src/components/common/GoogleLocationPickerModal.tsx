import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Navigation, Check, Sparkles, Loader2, Layers, Compass, ClipboardCheck } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifyInfo, notifyWarning, notifySuccess } from '../../utils/toast';
import { readAddressFromClipboard, parsePastedAddressOrMapLink } from '../../utils/maps';

interface GoogleLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
  onSelectAddress: (address: string) => void;
}

interface PlaceResult {
  title: string;
  subtitle: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

const LOCAL_LANDMARKS: PlaceResult[] = [
  // Hospitals & Clinics
  {
    title: 'Advanced International Hospital Islamabad',
    subtitle: 'Street 25, Markaz Road, Sector G-8/3, Islamabad',
    fullAddress: 'Advanced International Hospital, Street 25, Sector G-8/3, Islamabad',
    lat: 33.6844,
    lng: 73.0479
  },
  {
    title: 'Shifa Hospital / Pir Mehr Ali Shah Town',
    subtitle: 'Pir Mehr Ali Shah Town, Rawalpindi',
    fullAddress: 'Shifa Hospital, Pir Mehr Ali Shah Town, Rawalpindi',
    lat: 33.5822,
    lng: 73.0561
  },
  {
    title: 'PIMS Hospital (Pakistan Institute of Medical Sciences)',
    subtitle: 'Sector G-8/3, Islamabad',
    fullAddress: 'PIMS Hospital, Sector G-8/3, Islamabad',
    lat: 33.7058,
    lng: 73.0544
  },
  {
    title: 'Shifa International Hospital',
    subtitle: 'Pitras Bukhari Road, Sector H-8/4, Islamabad',
    fullAddress: 'Shifa International Hospital, Sector H-8/4, Islamabad',
    lat: 33.6888,
    lng: 73.0856
  },
  {
    title: 'Holy Family Hospital',
    subtitle: 'Holy Family Road, Satellite Town, Rawalpindi',
    fullAddress: 'Holy Family Hospital, Satellite Town, Rawalpindi',
    lat: 33.6335,
    lng: 73.0722
  },
  {
    title: 'Benazir Bhutto Hospital (BBH)',
    subtitle: 'Murree Road, Rawalpindi',
    fullAddress: 'Benazir Bhutto Hospital, Murree Road, Rawalpindi',
    lat: 33.6166,
    lng: 73.0678
  },
  {
    title: 'District Headquarter Hospital (DHQ)',
    subtitle: 'Kashmiri Bazaar, Rawalpindi',
    fullAddress: 'District Headquarter Hospital (DHQ), Kashmiri Bazaar, Rawalpindi',
    lat: 33.6062,
    lng: 73.0543
  },
  {
    title: 'KRL Hospital',
    subtitle: 'Sector G-9/1, Islamabad',
    fullAddress: 'KRL Hospital, Sector G-9/1, Islamabad',
    lat: 33.6892,
    lng: 73.0234
  },
  {
    title: 'Maroof International Hospital',
    subtitle: '10th Avenue, F-10 Markaz, Islamabad',
    fullAddress: 'Maroof International Hospital, F-10 Markaz, Islamabad',
    lat: 33.6931,
    lng: 73.0116
  },
  {
    title: 'Kulsum International Hospital',
    subtitle: 'Kulsum Plaza, Blue Area, Islamabad',
    fullAddress: 'Kulsum International Hospital, Blue Area, Islamabad',
    lat: 33.7145,
    lng: 73.0612
  },

  // Mandis & Markets
  {
    title: 'Ganj Mandi / غلہ منڈی',
    subtitle: 'Near Mandi More, Rawalpindi',
    fullAddress: 'Ganj Mandi (غلہ منڈی), Rawalpindi',
    lat: 33.6042,
    lng: 73.0531
  },
  {
    title: 'Chakri Road Commercial Market',
    subtitle: 'Chakri Road, Liaquat Colony, Rawalpindi',
    fullAddress: 'Chakri Road, Liaquat Colony, Rawalpindi',
    lat: 33.5678,
    lng: 73.0231
  },
  {
    title: 'Pir Mehr Ali Shah Town',
    subtitle: 'Bahar Colony, Khalid Colony, Rawalpindi',
    fullAddress: 'Pir Mehr Ali Shah Town, Rawalpindi',
    lat: 33.5822,
    lng: 73.0561
  },
  {
    title: 'Sabzi & Fruit Mandi Islamabad',
    subtitle: 'Sector I-11, Islamabad',
    fullAddress: 'Sabzi & Fruit Mandi, Sector I-11, Islamabad',
    lat: 33.6492,
    lng: 73.0315
  },
  {
    title: 'Grain Market Sector I-11/4',
    subtitle: 'Sector I-11/4, Islamabad',
    fullAddress: 'Grain Market, Sector I-11/4, Islamabad',
    lat: 33.6521,
    lng: 73.0342
  },
  {
    title: 'Raja Bazaar Market',
    subtitle: 'Raja Bazaar, Rawalpindi',
    fullAddress: 'Raja Bazaar, Rawalpindi',
    lat: 33.6125,
    lng: 73.0583
  },
  {
    title: 'Saddar Commercial Market',
    subtitle: 'Bank Road / Haider Road, Saddar, Rawalpindi',
    fullAddress: 'Saddar Bazaar, Bank Road, Rawalpindi',
    lat: 33.5954,
    lng: 73.0539
  },
  {
    title: 'Commercial Market Satellite Town',
    subtitle: 'Satellite Town Commercial, Rawalpindi',
    fullAddress: 'Commercial Market, Satellite Town, Rawalpindi',
    lat: 33.6358,
    lng: 73.0682
  },
  {
    title: 'Tench Bhatta Bazaar',
    subtitle: 'Tench Bhatta, Rawalpindi Cantt',
    fullAddress: 'Tench Bhatta, Rawalpindi',
    lat: 33.5789,
    lng: 73.0342
  },
  {
    title: 'Dhamial Road Market',
    subtitle: 'Dhamial Camp / Road, Rawalpindi',
    fullAddress: 'Dhamial Road, Rawalpindi',
    lat: 33.5512,
    lng: 73.0415
  },

  // Restaurants, Shops & Local G-9/4 and G-8 Points
  {
    title: 'Khyber Shinwari (خیبر شنواری)',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Khyber Shinwari (خیبر شنواری), Street 54, G-9/4, Islamabad',
    lat: 33.6842,
    lng: 73.0476
  },
  {
    title: 'Vertex Chemicals Pvt Ltd',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Vertex Chemicals Pvt Ltd, Street 54, G-9/4, Islamabad',
    lat: 33.6840,
    lng: 73.0474
  },
  {
    title: 'Aftab & Sons',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Aftab & Sons, Street 54, G-9/4, Islamabad',
    lat: 33.6838,
    lng: 73.0472
  },
  {
    title: 'Velmore INN Hotel',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Velmore INN Hotel, Street 54, G-9/4, Islamabad',
    lat: 33.6841,
    lng: 73.0465
  },
  {
    title: 'Baiga Paints & Hardware Store',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Baiga Paints & Hardware Store, Street 54, G-9/4, Islamabad',
    lat: 33.6837,
    lng: 73.0461
  },
  {
    title: 'Lahore Restaurant',
    subtitle: 'Street 55, Sector G-9/4, Islamabad',
    fullAddress: 'Lahore Restaurant, Street 55, G-9/4, Islamabad',
    lat: 33.6848,
    lng: 73.0471
  },
  {
    title: 'Punjab Chaat Palace',
    subtitle: 'Street 55, Sector G-9/4, Islamabad',
    fullAddress: 'Punjab Chaat Palace, Street 55, G-9/4, Islamabad',
    lat: 33.6847,
    lng: 73.0468
  },
  {
    title: 'Islamabad Fruits & Vegetables Store',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Islamabad Fruits & Vegetables Store, Street 54, G-9/4, Islamabad',
    lat: 33.6845,
    lng: 73.0458
  },
  {
    title: 'Quetta Bilal Cafe',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Quetta Bilal Cafe, Street 54, G-9/4, Islamabad',
    lat: 33.6843,
    lng: 73.0454
  },
  {
    title: 'Glaxay Boys Hostel',
    subtitle: 'Street 54, Sector G-9/4, Islamabad',
    fullAddress: 'Glaxay Boys Hostel, Street 54, G-9/4, Islamabad',
    lat: 33.6850,
    lng: 73.0478
  },

  // Key Sectors
  {
    title: 'Sector G-8 Markaz & Area',
    subtitle: 'G-8 Markaz, Islamabad',
    fullAddress: 'Sector G-8 Markaz, Islamabad',
    lat: 33.6844,
    lng: 73.0479
  },
  {
    title: 'Sector G-9 Markaz (Karachi Company)',
    subtitle: 'G-9 Markaz, Islamabad',
    fullAddress: 'Karachi Company, G-9 Markaz, Islamabad',
    lat: 33.6914,
    lng: 73.0289
  },
  {
    title: 'Sector G-10 Markaz',
    subtitle: 'G-10 Markaz, Islamabad',
    fullAddress: 'Sector G-10 Markaz, Islamabad',
    lat: 33.6881,
    lng: 73.0076
  },
  {
    title: 'Sector F-10 Markaz',
    subtitle: 'F-10 Markaz, Islamabad',
    fullAddress: 'Sector F-10 Markaz, Islamabad',
    lat: 33.6925,
    lng: 73.0112
  },
  {
    title: 'Sector F-8 Markaz',
    subtitle: 'F-8 Markaz (Ayub Market), Islamabad',
    fullAddress: 'Sector F-8 Markaz, Islamabad',
    lat: 33.7118,
    lng: 73.0392
  },
  {
    title: 'Blue Area Commercial Center',
    subtitle: 'Jinnah Avenue, Blue Area, Islamabad',
    fullAddress: 'Blue Area, Jinnah Avenue, Islamabad',
    lat: 33.7156,
    lng: 73.0645
  }
];

export const GoogleLocationPickerModal: React.FC<GoogleLocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialAddress = '',
  onSelectAddress
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'osm'>('roadmap');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);

  // Helper to build tile layers (No Carto watermark, authentic Google Maps & OSM)
  const createTileLayer = (L: any, type: 'roadmap' | 'satellite' | 'osm') => {
    if (type === 'satellite') {
      return L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps Satellite'
      });
    }
    if (type === 'osm') {
      return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      });
    }
    // Default: Google Roadmap (High-resolution, Urdu & English labels, shops, zero watermark)
    return L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });
  };

  // Switch between Map, Satellite, and OSM
  const handleSwitchMapType = (type: 'roadmap' | 'satellite' | 'osm') => {
    setMapType(type);
    if (!mapInstance.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (activeTileLayerRef.current) {
      mapInstance.current.removeLayer(activeTileLayerRef.current);
    }
    const newLayer = createTileLayer(L, type);
    newLayer.addTo(mapInstance.current);
    activeTileLayerRef.current = newLayer;
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };

  const handleResetToMandi = () => {
    if (mapInstance.current && markerInstance.current) {
      const mandiLat = 33.6042;
      const mandiLng = 73.0531;
      mapInstance.current.flyTo([mandiLat, mandiLng], 16, { duration: 1 });
      markerInstance.current.setLatLng([mandiLat, mandiLng]);
      setSelectedAddress('Ganj Mandi (غلہ منڈی), Rawalpindi');
      markerInstance.current
        .bindPopup('<b>Ganj Mandi (غلہ منڈی)</b><br/><span style="font-size: 10px; color: #64748b;">Rawalpindi Mandi Area</span>')
        .openPopup();
    }
  };

  // Initialize and load interactive Leaflet Map
  useEffect(() => {
    if (!isOpen) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
        activeTileLayerRef.current = null;
      }
      return;
    }

    const initAddress = initialAddress.trim() || 'Ganj Mandi (غلہ منڈی), Rawalpindi';
    setSelectedAddress(initialAddress.trim() || initAddress);
    setSearchQuery(initialAddress.trim());

    // Resolve initial LatLng
    let initialLat = 33.6042;
    let initialLng = 73.0531;

    const matchedLandmark = LOCAL_LANDMARKS.find((p) => {
      const q = initAddress.toLowerCase();
      return q.includes(p.title.toLowerCase().slice(0, 6)) || p.title.toLowerCase().includes(q.slice(0, 6));
    });
    if (matchedLandmark) {
      initialLat = matchedLandmark.lat;
      initialLng = matchedLandmark.lng;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstance.current) return;

      const L = (window as any).L;
      if (!L) {
        console.warn('Leaflet library loading...');
        return;
      }

      // Initialize map with high zoom and full interactive controls
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: false, // We use custom high-visibility zoom buttons
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      });
      mapInstance.current = map;

      // Add default Google Maps Roadmap layer
      const defaultLayer = createTileLayer(L, 'roadmap');
      defaultLayer.addTo(map);
      activeTileLayerRef.current = defaultLayer;

      // Fallback to OSM if Google tiles encounter network restrictions
      defaultLayer.on('tileerror', () => {
        if (mapInstance.current && activeTileLayerRef.current) {
          mapInstance.current.removeLayer(activeTileLayerRef.current);
          const osmFallback = createTileLayer(L, 'osm');
          osmFallback.addTo(mapInstance.current);
          activeTileLayerRef.current = osmFallback;
          setMapType('osm');
        }
      });

      // Custom animated red pin icon
      const pinHtml = `
        <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #dc2626; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
            <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `;
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: pinHtml,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44]
      });

      // Add marker
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);
      markerInstance.current = marker;

      marker.bindPopup(`<b>${initAddress}</b><br/><span style="font-size: 10.5px; color: #64748b;">(Click map or drag pin to change)</span>`).openPopup();

      // Click on Map to Drop/Move Pin
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        await reverseGeocode(lat, lng);
      });

      // Drag End on Pin
      marker.on('dragend', async () => {
        const { lat, lng } = marker.getLatLng();
        await reverseGeocode(lat, lng);
      });

      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
        activeTileLayerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Reverse geocodes coordinates to street & market address
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);

    // 1. Check if coords are close (~80 meters) to any known landmark, shop or restaurant
    const exactLandmark = LOCAL_LANDMARKS.find((p) => {
      const dLat = Math.abs(p.lat - lat);
      const dLng = Math.abs(p.lng - lng);
      return dLat < 0.0009 && dLng < 0.0009;
    });

    if (exactLandmark) {
      setSelectedAddress(exactLandmark.fullAddress);
      if (markerInstance.current) {
        markerInstance.current
          .bindPopup(`<b>${exactLandmark.title}</b><br/><span style="font-size: 10.5px; color: #475569;">${exactLandmark.fullAddress}</span>`)
          .openPopup();
      }
      setIsReverseGeocoding(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.residential || addr.street || addr.pedestrian || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
        const city = addr.city || addr.town || addr.county || 'Islamabad';

        const rawPoi =
          data.name && data.name !== road && !data.name.toLowerCase().startsWith('street')
            ? data.name
            : addr.restaurant ||
              addr.fast_food ||
              addr.cafe ||
              addr.hotel ||
              addr.shop ||
              addr.marketplace ||
              addr.hospital ||
              addr.clinic ||
              addr.amenity ||
              addr.building ||
              addr.commercial ||
              '';

        // Filter and deduplicate parts so street names never duplicate
        const parts: string[] = [];
        if (rawPoi && !parts.includes(rawPoi)) parts.push(rawPoi);
        if (road && !parts.includes(road)) parts.push(road);
        if (suburb && !parts.includes(suburb)) parts.push(suburb);
        if (city && !parts.includes(city)) parts.push(city);

        let resolved = parts.join(', ');

        if (!resolved && data.display_name) {
          resolved = data.display_name.split(',').slice(0, 4).join(',');
        } else if (!resolved) {
          resolved = `Location (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`;
        }

        setSelectedAddress(resolved);
        if (markerInstance.current) {
          markerInstance.current
            .bindPopup(`<b>${rawPoi || road || 'Selected Location'}</b><br/><span style="font-size: 10.5px; color: #475569;">${resolved}</span>`)
            .openPopup();
        }
      } else {
        const fallback = `Shop Location (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`;
        setSelectedAddress(fallback);
      }
    } catch {
      const fallback = `Shop Location (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`;
      setSelectedAddress(fallback);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Direct Search (Directly flies map to target without showing any dropdown list)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim();
    const qClean = q.toLowerCase();

    // 1. Check local landmarks (Hospitals, Sectors, Mandis, Markets, Restaurants)
    const localMatch = LOCAL_LANDMARKS.find((p) => {
      const qNorm = qClean.replace(/[^a-z0-9]/g, '');
      const titleNorm = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const subNorm = p.subtitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fullNorm = p.fullAddress.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Special phonetic matching for khebar / khyber / khaiber
      const qPhonetic = qNorm.replace(/khebar|khaiber|khabar/g, 'khyber');
      const titlePhonetic = titleNorm.replace(/khebar|khaiber|khabar/g, 'khyber');

      return (
        titleNorm.includes(qNorm) ||
        subNorm.includes(qNorm) ||
        fullNorm.includes(qNorm) ||
        titlePhonetic.includes(qPhonetic) ||
        qPhonetic.includes(titlePhonetic) ||
        (qNorm.length >= 3 && titleNorm.includes(qNorm.slice(0, 4)))
      );
    });

    if (localMatch) {
      setSelectedAddress(localMatch.fullAddress);
      if (mapInstance.current && markerInstance.current) {
        mapInstance.current.flyTo([localMatch.lat, localMatch.lng], 17, { duration: 1 });
        markerInstance.current.setLatLng([localMatch.lat, localMatch.lng]);
        markerInstance.current
          .bindPopup(`<b>${localMatch.title}</b><br/><span style="font-size: 10.5px; color: #64748b;">${localMatch.subtitle}</span>`)
          .openPopup();
      }
      notifyInfo(isUr ? `"${localMatch.title}" پر منتقل ہو گیا` : `Moved to "${localMatch.title}"`);
      return;
    }

    // 2. Search online via Nominatim Geocoding
    setIsSearchingOnline(true);
    try {
      const targetQuery = qClean.includes('pakistan') ? q : `${q}, Pakistan`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetQuery)}&format=json&limit=1&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          const resolved = first.display_name || first.name || q;
          setSelectedAddress(resolved);

          if (mapInstance.current && markerInstance.current) {
            mapInstance.current.flyTo([lat, lng], 17, { duration: 1 });
            markerInstance.current.setLatLng([lat, lng]);
            markerInstance.current
              .bindPopup(`<b>${first.name || q}</b><br/><span style="font-size: 10.5px;">${resolved}</span>`)
              .openPopup();
          }
          notifyInfo(isUr ? `"${first.name || q}" کا پتہ مل گیا` : `Found location for "${first.name || q}"`);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsSearchingOnline(false);
    }

    // Direct fallback
    setSelectedAddress(q);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      notifyWarning(isUr ? 'براؤزر لوکیشن کو سپورٹ نہیں کرتا' : 'Browser does not support GPS Geolocation');
      return;
    }

    setIsDetecting(true);
    notifyInfo(isUr ? 'موجودہ لوکیشن تلاش کی جا رہی ہے...' : 'Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        if (mapInstance.current && markerInstance.current) {
          mapInstance.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
          markerInstance.current.setLatLng([latitude, longitude]);
        }

        await reverseGeocode(latitude, longitude);
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        console.warn('Geolocation error:', err);
        notifyWarning(
          isUr
            ? 'لوکیشن رسائی کی اجازت نہیں ملی۔ آپ سرچ بار میں نام لکھ سکتے ہیں۔'
            : 'Location permission denied. Please search or enter address manually.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePasteIntoModal = async () => {
    const text = await readAddressFromClipboard();
    if (text) {
      setSelectedAddress(text);
      notifySuccess(isUr ? 'گوگل میپس سے کاپی شدہ پتہ پیسٹ ہو گیا!' : 'Address pasted from Google Maps!');
    } else {
      notifyWarning(
        isUr
          ? 'کلپ بورڈ پر کوئی پتہ نہیں ملا، آپ باکس میں خود Ctrl+V دبا سکتے ہیں'
          : 'No address in clipboard. You can press Ctrl+V directly in the input'
      );
    }
  };

  const handleConfirm = () => {
    const finalVal = selectedAddress.trim() || searchQuery.trim();
    if (finalVal) {
      onSelectAddress(finalVal);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-xs my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>{isUr ? 'گوگل میپ و لوکیشن سلیکٹر' : 'Google Maps Location Picker'}</span>
                <span className="text-[10px] bg-emerald-600/80 px-2 py-0.5 rounded-full text-emerald-100 font-semibold">
                  Live View
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100/90">
                {isUr
                  ? 'نقشے پر کہیں بھی کلک کریں، پن منتقل کریں یا ہسپتال/مارکیٹ سرچ کریں'
                  : 'Click anywhere on map, drag the red pin, or search to auto-fill address'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Direct Search Bar & GPS Button (NO DROPDOWN LIST UNDERNEATH) */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  isUr
                    ? 'ہسپتال، مارکیٹ یا سیکٹر تلاش کریں (مثلاً G8, PIMS, Advanced Hospital, Raja Bazaar)...'
                    : 'Search place, hospital, market or sector (e.g. G8, PIMS, Advanced Hospital, Raja Bazaar)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-emerald-500/70 focus:border-emerald-700 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={isSearchingOnline}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
            >
              {isSearchingOnline ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isUr ? 'تلاش...' : 'Searching...'}</span>
                </>
              ) : (
                <span>{isUr ? 'سرچ کریں' : 'Search'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
              title={isUr ? 'موجودہ GPS لوکیشن حاصل کریں' : 'Detect My GPS Location'}
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-700 ${isDetecting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isUr ? 'میری لوکیشن' : 'GPS'}</span>
            </button>
          </form>

          {/* LARGE INTERACTIVE MAP CONTAINER WITH HIGH CONTRAST CONTROLS */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner bg-slate-200">
            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-[370px] sm:h-[410px] bg-slate-200"
              style={{ minHeight: '370px' }}
            />

            {/* Top-Left: High Contrast Zoom Controls (+ and -) */}
            <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 shadow-md">
              <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-slate-200 overflow-hidden flex flex-col divide-y divide-slate-100 shadow-sm">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-9 h-9 flex items-center justify-center text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 font-black text-xl transition-colors cursor-pointer select-none"
                  title={isUr ? 'زوم ان کریں (+)' : 'Zoom In (+)'}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-9 h-9 flex items-center justify-center text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 font-black text-xl transition-colors cursor-pointer select-none"
                  title={isUr ? 'زوم آؤٹ کریں (-)' : 'Zoom Out (-)'}
                >
                  -
                </button>
              </div>
            </div>

            {/* Top-Right: Map Style Switcher (Map / Satellite / OSM) */}
            <div className="absolute top-3 right-3 z-[400] flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-md">
              <button
                type="button"
                onClick={() => handleSwitchMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isUr ? '🗺️ نقشہ' : '🗺️ Map'}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isUr ? '🛰️ سیٹلائٹ' : '🛰️ Satellite'}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMapType('osm')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  mapType === 'osm'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                OSM
              </button>
            </div>

            {/* Bottom-Left: Quick Center Mandi Button */}
            <div className="absolute bottom-3 left-3 z-[400]">
              <button
                type="button"
                onClick={handleResetToMandi}
                className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 hover:text-emerald-800 hover:bg-emerald-50 text-[10.5px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                title={isUr ? 'راولپنڈی و غلہ منڈی سینٹر' : 'Reset to Mandi Center'}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'غلہ منڈی سینٹر' : 'Center Mandi'}</span>
              </button>
            </div>

            {/* Loading Indicator while Reverse Geocoding */}
            {isReverseGeocoding && (
              <div className="absolute top-3 left-16 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 text-[11px] font-bold text-slate-800">
                <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                <span>{isUr ? 'پتہ معلوم کیا جا رہا ہے...' : 'Resolving clicked address...'}</span>
              </div>
            )}

            {/* Bottom-Right: Helper text badge */}
            <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1 font-semibold pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Click Map or Drag Pin</span>
            </div>
          </div>

          {/* Address Edit & Preview Box (GREEN AREA) */}
          <div className="bg-emerald-50 border-2 border-emerald-500 p-3 rounded-xl space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'منتخب شدہ پتہ (یہاں خود بخود آ گیا ہے):' : 'Selected Address (Auto-filled from map selection):'}</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePasteIntoModal}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 rounded-md text-[10px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                  title={isUr ? 'گوگل میپس سے کاپی شدہ پتہ یہاں پیسٹ کریں' : 'Paste copied location/address from Google Maps'}
                >
                  <ClipboardCheck className="w-3 h-3 text-emerald-700" />
                  <span>{isUr ? '📋 کاپی شدہ پتہ پیسٹ کریں' : '📋 Paste Address'}</span>
                </button>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {isUr ? 'حتمی ایڈریس' : 'Final Address'}
                </span>
              </div>
            </div>
            <input
              type="text"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(parsePastedAddressOrMapLink(e.target.value))}
              placeholder={isUr ? 'نقشے پر کلک کریں، گوگل میپ سے کاپی کر کے پیسٹ کریں یا خود لکھیں...' : 'Click on map, paste copied Google Maps address or type here...'}
              className="w-full px-3 py-2 bg-white border border-emerald-500 rounded-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 text-xs shadow-inner"
            />
            <span className="text-[10px] text-emerald-900 block font-medium">
              {isUr
                ? 'نقشے پر کلک کریں، نئی ٹیب والے گوگل میپ سے ایڈریس کاپی کر کے "پیسٹ کریں" دبائیں، یا خود لکھیں۔'
                : 'Click map, copy address from Google Maps tab & click "Paste Address", or type directly.'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            {isUr ? 'منسوخ' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isUr ? 'پتہ شامل کریں' : 'Apply Address'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
