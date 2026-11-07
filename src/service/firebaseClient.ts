import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIpRs20fov6-BF3urlkVVxsPNDomfF2qQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crochetcomso.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crochetcomso",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crochetcomso.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370920891701",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:370920891701:web:ba88f1bfa58ada325f587c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});

export const uploadScreenshotToStorage = async (base64Data: string, orderId: string): Promise<string> => {
  if (!base64Data || !base64Data.startsWith("data:")) return base64Data || "";
  try {
    const fileRef = ref(storage, `payment_screenshots/${orderId}_${Date.now()}.png`);
    await uploadString(fileRef, base64Data, "data_url");
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    return base64Data;
  }
};

// Direct Firestore Helpers for Storefront App

export const fetchProductsDirect = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("fetchProductsDirect error:", error);
    return [];
  }
};

export const fetchProductByIdDirect = async (id: string): Promise<any> => {
  try {
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error(`fetchProductByIdDirect error for ${id}:`, error);
    return null;
  }
};

export const saveOrderDirect = async (orderData: any): Promise<any> => {
  try {
    const orderId = orderData.id || `ORD-${Date.now().toString().slice(-4)}`;
    const itemsList = Array.isArray(orderData.items) ? orderData.items : [];
    const totalUSD = itemsList.reduce((acc: number, item: any) => acc + (Number(item.priceUSD || item.price || 0) * Number(item.quantity || 1)), 0);
    const itemsCount = itemsList.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0);

    let paymentDetails = orderData.paymentDetails ? { ...orderData.paymentDetails } : null;
    
    // Upload base64 screenshot to Firebase Storage CDN if present
    if (paymentDetails && paymentDetails.screenshotBase64) {
      try {
        const cdnUrl = await uploadScreenshotToStorage(paymentDetails.screenshotBase64, orderId);
        paymentDetails.screenshotUrl = cdnUrl;
        // remove heavy base64 string to keep document clean
        delete paymentDetails.screenshotBase64;
      } catch (stgErr) {
        console.warn("Storage upload fallback notice:", stgErr);
      }
    }

    const fullOrder = {
      ...orderData,
      id: orderId,
      customerName: orderData.customer?.name || orderData.customerName || "Customer",
      email: orderData.customer?.email || orderData.email || "",
      phone: orderData.customer?.phone || orderData.phone || "",
      totalUSD: totalUSD > 0 ? totalUSD : Number(orderData.totalUSD || 0),
      totalPKR: totalUSD > 0 ? Math.round(totalUSD * 280) : Number(orderData.totalPKR || 0),
      itemsCount: itemsCount > 0 ? itemsCount : Number(orderData.itemsCount || 1),
      status: orderData.status || "Pending",
      paymentMethod: orderData.paymentMethod || "Cash on Delivery",
      paymentDetails: paymentDetails || null,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    // Save directly to 'orders' collection in Firestore
    await setDoc(doc(db, "orders", orderId), fullOrder);

    // Decrement product inventory directly in Firestore
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        if (item.id) {
          try {
            const pRef = doc(db, "products", item.id);
            const pSnap = await getDoc(pRef);
            if (pSnap.exists()) {
              const currentStock = pSnap.data().stockQuantity || 10;
              const newQty = Math.max(0, currentStock - (item.quantity || 1));
              await updateDoc(pRef, {
                stockQuantity: newQty,
                inStock: newQty > 0
              });
            }
          } catch (stkErr) {
            console.warn("Stock update notice:", stkErr);
          }
        }
      }
    }

    return fullOrder;
  } catch (error) {
    console.error("saveOrderDirect error:", error);
    throw error;
  }
};

export const fetchUserOrdersDirect = async (userFilter?: { email?: string; phone?: string }): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "orders"));
    let orders: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (userFilter?.email || userFilter?.phone) {
      const cleanDigits = (str?: string) => (str ? str.replace(/\D/g, "") : "");
      const uPhoneDigits = cleanDigits(userFilter.phone);

      orders = orders.filter((o: any) => {
        const cEmail = o.customer?.email || o.email || "";
        const cPhone = o.customer?.phone || o.phone || "";
        const ordPhoneDigits = cleanDigits(cPhone);

        const emailMatch = userFilter.email && cEmail.toLowerCase() === userFilter.email.toLowerCase();
        const phoneMatch = uPhoneDigits.length > 5 && ordPhoneDigits.includes(uPhoneDigits.slice(-7));

        return emailMatch || phoneMatch;
      });
    }

    return orders;
  } catch (error) {
    console.error("fetchUserOrdersDirect error:", error);
    return [];
  }
};

export const saveInquiryDirect = async (inquiryData: any): Promise<any> => {
  try {
    const id = inquiryData.id || `INQ-${Date.now().toString().slice(-4)}`;
    const fullInquiry = {
      ...inquiryData,
      id,
      status: "New",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "custom_inquiries", id), fullInquiry);
    return fullInquiry;
  } catch (error) {
    console.error("saveInquiryDirect error:", error);
    throw error;
  }
};

export const fetchArtisansDirect = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "artisans"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("fetchArtisansDirect error:", error);
    return [];
  }
};

export const fetchBannersDirect = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "banners"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("fetchBannersDirect error:", error);
    return [];
  }
};

export const saveUserProfileDirect = async (userProfile: any): Promise<any> => {
  try {
    const userId = userProfile.id || `usr_${Date.now()}`;
    await setDoc(doc(db, "users", userId), { ...userProfile, id: userId }, { merge: true });
    return { ...userProfile, id: userId };
  } catch (error) {
    console.error("saveUserProfileDirect error:", error);
    throw error;
  }
};

export const fetchPopularCategoriesDirect = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "popular_categories"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("fetchPopularCategoriesDirect error:", error);
    return [];
  }
};

export const saveContactMessageDirect = async (messageData: any): Promise<any> => {
  try {
    const id = messageData.id || `MSG-${Date.now().toString().slice(-4)}`;
    const fullMessage = {
      ...messageData,
      id,
      status: "New",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "contact_messages", id), fullMessage);
    return fullMessage;
  } catch (error) {
    console.error("saveContactMessageDirect error:", error);
    throw error;
  }
};

export const fetchCategoryBannersDirect = async (): Promise<any> => {
  try {
    const docSnap = await getDoc(doc(db, "settings", "category_banners"));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("fetchCategoryBannersDirect error:", error);
    return null;
  }
};

export const saveMasterclassRequestDirect = async (requestData: any): Promise<any> => {
  try {
    const id = requestData.id || `MCR-${Date.now().toString().slice(-4)}`;
    const fullRequest = {
      ...requestData,
      id,
      status: "New",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "masterclass_requests", id), fullRequest);
    return fullRequest;
  } catch (error) {
    console.error("saveMasterclassRequestDirect error:", error);
    throw error;
  }
};

export const fetchTutorialsDirect = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, "tutorials"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("fetchTutorialsDirect error:", error);
    return [];
  }
};
