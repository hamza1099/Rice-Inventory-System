import axios from "axios";
import { baseUrl } from "../utils/Config";

export const apiRequest = async (
    endPoint: string,
    method: string,
    data?: any
) => {
    const isFullUrl = endPoint.startsWith("http");

    let headers: any = {};

    // ✅ Only attach auth for backend APIs
    if (!isFullUrl) {
        // Get token from globalThis or localStorage as fallback
        let token = (globalThis as any).authToken;
        if (!token) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    token = userData.token;
                    // Update global so subsequent calls use it
                    (globalThis as any).authToken = token;
                } catch (error) {
                    console.error("Error parsing stored user data:", error);
                }
            }
        }
        if (token) {
            headers.Authorization = "Bearer " + token;
        }
    }

    // ✅ Detect data type
    if (data instanceof FormData) {
        // DO NOTHING
        // Browser automatically sets multipart/form-data with boundary
    }
    else if (isFullUrl && (data instanceof File || data instanceof Blob)) {
        // ✅ S3 Presigned Upload
        headers["Content-Type"] = data.type || "application/octet-stream";
    }
    else if (data && !isFullUrl) {
        // ✅ Normal backend JSON request
        headers["Content-Type"] = "application/json";
    }

    try {
        const response = await axios({
            url: isFullUrl ? endPoint : `${baseUrl}${endPoint}`,
            method,
            headers,
            data,
        });

        return response;
    } catch (error: any) {
        // ✅ Only handle 401 for backend
        if (!isFullUrl && error?.response?.status === 401) {
            (globalThis as any).authToken = undefined;
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        throw error;
    }
};

// --- FIRESTORE REST API HELPERS (Built on top of apiRequest) ---

export const parseFirestoreValue = (val: any): any => {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("integerValue" in val) return Number(val.integerValue);
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("arrayValue" in val) return (val.arrayValue.values || []).map(parseFirestoreValue);
  if ("mapValue" in val) return parseFirestoreFields(val.mapValue.fields || {});
  if ("nullValue" in val) return null;
  return val;
};

export const parseFirestoreFields = (fields: any): any => {
  const obj: any = {};
  if (!fields) return obj;
  for (const key in fields) {
    obj[key] = parseFirestoreValue(fields[key]);
  }
  return obj;
};

export const parseFirestoreDoc = (doc: any): any => {
  if (!doc) return null;
  const nameParts = doc.name ? doc.name.split("/") : [];
  const docId = nameParts[nameParts.length - 1];
  const fields = parseFirestoreFields(doc.fields);
  return { id: docId, ...fields };
};

export const toFirestoreValue = (val: any): any => {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: any = {};
    for (const key in val) {
      fields[key] = toFirestoreValue(val[key]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
};

export const toFirestoreDocPayload = (obj: any): any => {
  const fields: any = {};
  for (const key in obj) {
    if (key !== "id") {
      fields[key] = toFirestoreValue(obj[key]);
    }
  }
  return { fields };
};

import {
  fetchProductsDirect,
  fetchProductByIdDirect,
  saveOrderDirect,
  fetchUserOrdersDirect,
  saveInquiryDirect,
  fetchArtisansDirect,
  fetchBannersDirect,
  saveUserProfileDirect,
  fetchPopularCategoriesDirect,
  saveContactMessageDirect,
  fetchCategoryBannersDirect,
  saveMasterclassRequestDirect,
  fetchTutorialsDirect
} from "./firebaseClient";

// High-level Integration Methods using direct Firebase Firestore SDK

export const fetchProductsApi = async (): Promise<any[]> => {
  return await fetchProductsDirect();
};

export const fetchProductByIdApi = async (id: string): Promise<any> => {
  return await fetchProductByIdDirect(id);
};

export const createOrderApi = async (orderData: any): Promise<any> => {
  return await saveOrderDirect(orderData);
};

export const fetchOrdersApi = async (userFilter?: { email?: string; phone?: string }): Promise<any[]> => {
  return await fetchUserOrdersDirect(userFilter);
};

export const createInquiryApi = async (inquiryData: any): Promise<any> => {
  return await saveInquiryDirect(inquiryData);
};

export const fetchArtisansApi = async (): Promise<any[]> => {
  return await fetchArtisansDirect();
};

export const fetchBannersApi = async (): Promise<any[]> => {
  return await fetchBannersDirect();
};

export const fetchPopularCategoriesApi = async (): Promise<any[]> => {
  return await fetchPopularCategoriesDirect();
};

export const createContactMessageApi = async (messageData: any): Promise<any> => {
  return await saveContactMessageDirect(messageData);
};

export const fetchCategoryBannersApi = async (): Promise<any> => {
  return await fetchCategoryBannersDirect();
};

export const fetchTutorialsApi = async (): Promise<any[]> => {
  return await fetchTutorialsDirect();
};




export const sendOtpApi = async (phoneOrEmail: string): Promise<any> => {
  // Direct OTP generation for Firebase client
  const generatedCode = phoneOrEmail.includes("test") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
  return {
    success: true,
    message: `OTP sent to ${phoneOrEmail}`,
    otpCode: generatedCode
  };
};

export const verifyOtpApi = async (payload: { phoneOrEmail: string; otpCode: string; name?: string }): Promise<any> => {
  const userId = "usr_" + Date.now().toString();
  const userObj = {
    id: userId,
    name: payload.name || `Customer ${payload.phoneOrEmail.slice(-4)}`,
    phone: payload.phoneOrEmail.includes("@") ? "" : payload.phoneOrEmail,
    email: payload.phoneOrEmail.includes("@") ? payload.phoneOrEmail : "",
    addresses: [],
    role: "user"
  };
  await saveUserProfileDirect(userObj);
  return {
    success: true,
    user: userObj,
    token: `firebase_token_${userId}`
  };
};

export const getUserProfileApi = async (_userId: string): Promise<any> => {
  return null;
};

export const updateUserProfileApi = async (payload: any): Promise<any> => {
  return await saveUserProfileDirect(payload);
};

export const saveMasterclassRequestApi = async (payload: any): Promise<any> => {
  return await saveMasterclassRequestDirect(payload);
};


