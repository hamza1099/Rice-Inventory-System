const ACCESS_KEY = import.meta.env.VITE_BUNNY_STORAGE_ACCESS_KEY || '';
const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE || 'bukharirice';
const rawCdn = import.meta.env.VITE_BUNNY_CDN_URL || 'https://bukharirice.b-cdn.net/';
export const CDN_URL = rawCdn.endsWith('/') ? rawCdn : `${rawCdn}/`;

const rawRegion = (import.meta.env.VITE_BUNNY_REGION || '').trim().toLowerCase();
const regionPrefix = (!rawRegion || rawRegion === 'de' || rawRegion === 'main')
  ? ''
  : rawRegion.endsWith('.') ? rawRegion : `${rawRegion}.`;

// BunnyCDN Storage endpoint
const REGION_URL = `https://${regionPrefix}storage.bunnycdn.com`;

export const uploadToBunny = async (file: File, folder: string = "products"): Promise<string> => {
  if (!ACCESS_KEY || !STORAGE_ZONE) {
    throw new Error("Bunny Storage configuration is missing. Please check .env settings.");
  }

  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const timestamp = Date.now();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
  const fileName = `${timestamp}_${safeName}`;
  const filePath = cleanFolder ? `/${cleanFolder}/${fileName}` : `/${fileName}`;
  const url = `${REGION_URL}/${STORAGE_ZONE}${filePath}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "AccessKey": ACCESS_KEY,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    
    if (!response.ok) {
      throw new Error(`Bunny storage upload failed (${response.status}): ${response.statusText}`);
    }
    
    return cleanFolder ? `${CDN_URL}${cleanFolder}/${fileName}` : `${CDN_URL}${fileName}`;
  } catch (error) {
    console.error("Bunny upload error:", error);
    throw error;
  }
};

export const deleteFromBunny = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !fileUrl.startsWith(CDN_URL)) return; // Only delete if it's from our CDN

  const relativePath = fileUrl.replace(CDN_URL, "");
  const filePath = `/${relativePath.replace(/^\/+/, '')}`;
  const url = `${REGION_URL}/${STORAGE_ZONE}${filePath}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "AccessKey": ACCESS_KEY
      }
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Bunny storage delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Bunny delete error:", error);
  }
};
