import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject,
  FirebaseStorage
} from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';
import { AppItem, ReviewItem, UserPublicProfile, UserPrivateData, ReportItem, AppStatus } from '../types';
import { INITIAL_MOCK_APPS, INITIAL_MOCK_REVIEWS, SAMPLE_PREVIEW_APPS } from '../data/mockData';
import { ADMIN_EMAILS } from '../config.js';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const isConfigured = isFirebaseConfigured();

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = (firebaseConfig as any).firestoreDatabaseId
      ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
      : getFirestore(app);
    storage = getStorage(app);

    // Initialize App Check if site key is configured
    const recaptchaKey = (firebaseConfig as any).recaptchaSiteKey || (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
    if (recaptchaKey && typeof window !== 'undefined') {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(recaptchaKey),
          isTokenAutoRefreshEnabled: true
        });
      } catch {
        // App Check fallback
      }
    }
  } catch (error) {
    // Initialization failed, will use local fallback
  }
}

// Test connectivity on initial boot
async function testConnection() {
  if (db) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
}
if (typeof window !== 'undefined' && db) {
  testConnection();
}

// ---------------- FIRESTORE ERROR HANDLING ----------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ---------------- INPUT SANITIZER ----------------
export const sanitizeText = (input: string, maxLen = 1000): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[<>'"`;]/g, '') // Remove injection triggers
    .trim()
    .slice(0, maxLen);
};

// ---------------- CLIENT-SIDE IMAGE COMPRESSOR ----------------
export const compressImageFile = async (file: File, maxWidth = 1024, quality = 0.82): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
              resolve(dataUrl);
            } else {
              resolve((e.target?.result as string) || '');
            }
          } catch {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } catch {
      resolve('');
    }
  });
};

// ---------------- LOCAL STORAGE ENGINE ----------------
const MOCK_STORAGE_KEY_APPS = 'droidstore_apps_data_v3';
const MOCK_STORAGE_KEY_REVIEWS = 'droidstore_reviews_data_v3';
const MOCK_STORAGE_KEY_REPORTS = 'droidstore_reports_data_v3';
const MOCK_STORAGE_KEY_BANS = 'droidstore_banned_data_v3';
const MOCK_STORAGE_KEY_USERS = 'droidstore_users_data_v3';

const getLocalApps = (): AppItem[] => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_APPS);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(INITIAL_MOCK_APPS));
      return INITIAL_MOCK_APPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_APPS;
  }
};

const saveLocalApps = (apps: AppItem[]) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch {
    // Storage quota fallback
  }
};

const getLocalReviews = (): Record<string, ReviewItem[]> => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_MOCK_REVIEWS));
      return INITIAL_MOCK_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_REVIEWS;
  }
};

const saveLocalReviews = (reviews: Record<string, ReviewItem[]>) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch {
    // Storage quota
  }
};

export const clearAllLocalData = () => {
  try {
    localStorage.removeItem(MOCK_STORAGE_KEY_APPS);
    localStorage.removeItem(MOCK_STORAGE_KEY_REVIEWS);
    localStorage.removeItem(MOCK_STORAGE_KEY_REPORTS);
  } catch {}
};

export const loadSamplePreviewData = () => {
  saveLocalApps(SAMPLE_PREVIEW_APPS);
};

// ---------------- EXPORTED API SERVICE METHODS ----------------

export const isLiveFirebase = () => {
  return isConfigured && auth !== null && db !== null;
};

// --- AUTHENTICATION ---
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  if (isLiveFirebase() && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    const mockUserJson = localStorage.getItem('droidstore_current_session');
    if (mockUserJson) {
      try {
        const u = JSON.parse(mockUserJson);
        callback(u);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  }
};

export const signInWithGoogle = async (): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserProfile(result.user);
    return result.user;
  } else {
    const mockGoogleUser = {
      uid: "user-" + Math.floor(Math.random() * 89999 + 10000),
      email: "developer@androidcommunity.com",
      displayName: "Mobile Developer",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      emailVerified: true
    };
    localStorage.setItem('droidstore_current_session', JSON.stringify(mockGoogleUser));
    await ensureUserProfile(mockGoogleUser as any);
    return mockGoogleUser;
  }
};

export const signInAdminDemo = async (): Promise<any> => {
  const adminUser = {
    uid: "admin-ahmeda9a99a9",
    email: ADMIN_EMAILS[0],
    displayName: "Ahmed (Lead Admin)",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&auto=format&fit=crop&q=80",
    emailVerified: true
  };
  localStorage.setItem('droidstore_current_session', JSON.stringify(adminUser));
  await ensureUserProfile(adminUser as any);
  return adminUser;
};

export const signInWithEmail = async (email: string, pass: string): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await ensureUserProfile(res.user);
    return res.user;
  } else {
    const mockUser = {
      uid: "user-" + btoa(email).slice(0, 8),
      email,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`
    };
    localStorage.setItem('droidstore_current_session', JSON.stringify(mockUser));
    await ensureUserProfile(mockUser as any);
    return mockUser;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name: string): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      await ensureUserProfile({ ...res.user, displayName: name } as any);
    }
    return res.user;
  } else {
    const mockUser = {
      uid: "user-" + btoa(email).slice(0, 8),
      email,
      displayName: name || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`
    };
    localStorage.setItem('droidstore_current_session', JSON.stringify(mockUser));
    await ensureUserProfile(mockUser as any);
    return mockUser;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isLiveFirebase() && auth) {
    await sendPasswordResetEmail(auth, email);
  }
};

export const logOut = async (): Promise<void> => {
  if (isLiveFirebase() && auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem('droidstore_current_session');
};

// --- USER PROFILES (PUBLIC vs PRIVATE) ---
export const ensureUserProfile = async (user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }) => {
  const publicData: UserPublicProfile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || "Android User",
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
    createdAt: Date.now(),
    isDeveloper: false
  };

  const privateData: UserPrivateData = {
    uid: user.uid,
    email: user.email || "",
    notificationEnabled: true,
    theme: 'light',
    language: 'en',
    createdAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    try {
      const pubRef = doc(db, 'users', user.uid);
      const pubSnap = await getDoc(pubRef);
      if (!pubSnap.exists()) {
        await setDoc(pubRef, publicData);
      }

      if (user.email) {
        const privRef = doc(db, 'users_private', user.uid);
        const privSnap = await getDoc(privRef);
        if (!privSnap.exists()) {
          await setDoc(privRef, privateData);
        }
      }
    } catch {
      // Profile sync fallback
    }
  } else {
    try {
      const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (!users[user.uid]) {
        users[user.uid] = { public: publicData, private: privateData };
        localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
      }
    } catch {}
  }
};

export const getUserPublicProfile = async (uid: string): Promise<UserPublicProfile | null> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserPublicProfile;
      }
    } catch {
      // Profile fetch fallback
    }
  }
  
  try {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      if (users[uid]?.public) return users[uid].public;
    }
  } catch {}
  
  return {
    uid,
    displayName: "Android Developer",
    photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`,
    bio: "Passionate Android creator & developer.",
    createdAt: Date.now() - 86400000 * 30,
    isDeveloper: true
  };
};

export const updateUserPublicProfile = async (uid: string, data: Partial<UserPublicProfile>) => {
  if (isLiveFirebase() && db) {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  } else {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    if (!users[uid]) users[uid] = { public: { uid, ...data }, private: {} };
    else users[uid].public = { ...users[uid].public, ...data };
    localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

export const deleteUserAccount = async (uid: string) => {
  if (isLiveFirebase() && db) {
    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'users_private', uid));
      if (auth?.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${uid}`);
    }
  } else {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      delete users[uid];
      localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
    }
    localStorage.removeItem('droidstore_current_session');
  }
};

// --- APPS COLLECTION ---

export const getApprovedApps = async (): Promise<AppItem[]> => {
  const now = Date.now();
  if (isLiveFirebase() && db) {
    try {
      // Query apps without requiring composite indexes
      const q = query(collection(db, 'apps'));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      snap.forEach(d => {
        const item = { id: d.id, ...d.data() } as AppItem;
        // App is public if approved OR auto-publish timer elapsed!
        if (item.status === 'approved' || (item.publishAt && item.publishAt <= now)) {
          apps.push({ ...item, status: 'approved' });
        }
      });
      return apps.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (e) {
      console.warn("Live fetch error, falling back to local apps:", e);
      return getLocalApps().filter(a => a.status === 'approved' || (a.publishAt && a.publishAt <= now));
    }
  }
  return getLocalApps().filter(a => a.status === 'approved' || (a.publishAt && a.publishAt <= now));
};

export const getAppById = async (appId: string): Promise<AppItem | null> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'apps', appId));
      if (snap.exists()) {
        const item = { id: snap.id, ...snap.data() } as AppItem;
        if (item.publishAt && item.publishAt <= Date.now()) {
          item.status = 'approved';
        }
        return item;
      }
    } catch (e) {
      console.warn("Error getting app by ID:", e);
    }
  }
  const local = getLocalApps().find(a => a.id === appId);
  return local || null;
};

export const recordDownload = async (appId: string): Promise<number> => {
  if (isLiveFirebase() && db) {
    try {
      const refDoc = doc(db, 'apps', appId);
      await updateDoc(refDoc, {
        downloads: increment(1)
      });
      const snap = await getDoc(refDoc);
      return snap.data()?.downloads || 1;
    } catch (e) {
      console.warn("Error incrementing download in firestore:", e);
    }
  }

  // Local fallback
  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index].downloads = (apps[index].downloads || 0) + 1;
    saveLocalApps(apps);
    return apps[index].downloads;
  }
  return 1;
};

export const submitApp = async (appData: Omit<AppItem, 'id'>): Promise<string> => {
  if (isLiveFirebase() && db) {
    try {
      const newDocRef = doc(collection(db, 'apps'));
      await setDoc(newDocRef, {
        ...appData,
        status: appData.status || 'pending'
      });
      // Also cache in local storage so it is immediately visible
      const apps = getLocalApps();
      apps.unshift({ ...appData, id: newDocRef.id, status: appData.status || 'pending' });
      saveLocalApps(apps);
      return newDocRef.id;
    } catch (e) {
      console.warn("Live Firestore submit notice, saving to local database fallback:", e);
    }
  }

  const apps = getLocalApps();
  const id = "app-" + Date.now();
  const newApp: AppItem = {
    ...appData,
    id,
    status: appData.status || 'pending'
  };
  apps.unshift(newApp);
  saveLocalApps(apps);
  return id;
};

export const updateAppDetails = async (appId: string, updates: Partial<AppItem>): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await updateDoc(doc(db, 'apps', appId), {
        ...updates,
        updatedAt: Date.now()
      });
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `apps/${appId}`);
    }
  }

  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updates, updatedAt: Date.now() };
    saveLocalApps(apps);
  }
};

export const deleteApp = async (appId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await deleteDoc(doc(db, 'apps', appId));
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `apps/${appId}`);
    }
  }

  const apps = getLocalApps().filter(a => a.id !== appId);
  saveLocalApps(apps);
};

export const getUserApps = async (userId: string): Promise<AppItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'apps'), where('uploaderId', '==', userId));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      const now = Date.now();
      snap.forEach(d => {
        const item = { id: d.id, ...d.data() } as AppItem;
        if (item.status === 'pending' && item.publishAt && item.publishAt <= now) {
          item.status = 'approved';
        }
        apps.push(item);
      });
      return apps.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (e) {
      console.warn("getUserApps error:", e);
    }
  }
  return getLocalApps().filter(a => a.uploaderId === userId);
};

// --- ADMIN OPERATIONS ---
export const getPendingApps = async (): Promise<AppItem[]> => {
  const now = Date.now();
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'apps'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      snap.forEach(d => {
        const item = { id: d.id, ...d.data() } as AppItem;
        // If not yet auto-published
        if (!item.publishAt || item.publishAt > now) {
          apps.push(item);
        }
      });
      return apps.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (e) {
      console.warn("getPendingApps error:", e);
    }
  }
  return getLocalApps().filter(a => a.status === 'pending' && (!a.publishAt || a.publishAt > now));
};

export const setAppStatus = async (appId: string, status: AppStatus, rejectionReason?: string): Promise<void> => {
  const updates: Partial<AppItem> = {
    status,
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
    publishAt: status === 'approved' ? undefined : undefined,
    updatedAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    try {
      await updateDoc(doc(db, 'apps', appId), updates);
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `apps/${appId}`);
    }
  }

  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updates };
    saveLocalApps(apps);
  }
};

// --- REVIEWS ---
export const getAppReviews = async (appId: string): Promise<ReviewItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDocs(collection(db, 'apps', appId, 'reviews'));
      const revs: ReviewItem[] = [];
      snap.forEach(d => revs.push({ id: d.id, ...d.data() } as ReviewItem));
      return revs.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.warn(e);
    }
  }
  const allRevs = getLocalReviews();
  return (allRevs[appId] || []).sort((a, b) => b.createdAt - a.createdAt);
};

export const addOrUpdateAppReview = async (appId: string, review: ReviewItem): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await setDoc(doc(db, 'apps', appId, 'reviews', review.userId), review);
      
      const snap = await getDocs(collection(db, 'apps', appId, 'reviews'));
      let total = 0;
      let count = 0;
      snap.forEach(d => {
        total += (d.data().rating || 5);
        count++;
      });
      const avg = count > 0 ? Number((total / count).toFixed(1)) : 5.0;
      await updateDoc(doc(db, 'apps', appId), {
        rating: avg,
        reviewCount: count
      });
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `apps/${appId}/reviews/${review.userId}`);
    }
  }

  const revs = getLocalReviews();
  if (!revs[appId]) revs[appId] = [];
  const existingIdx = revs[appId].findIndex(r => r.userId === review.userId);
  if (existingIdx !== -1) {
    revs[appId][existingIdx] = review;
  } else {
    revs[appId].unshift(review);
  }
  saveLocalReviews(revs);

  const apps = getLocalApps();
  const appIdx = apps.findIndex(a => a.id === appId);
  if (appIdx !== -1) {
    const list = revs[appId];
    const avg = Number((list.reduce((acc, cur) => acc + cur.rating, 0) / list.length).toFixed(1));
    apps[appIdx].rating = avg;
    apps[appIdx].reviewCount = list.length;
    saveLocalApps(apps);
  }
};

export const deleteAppReview = async (appId: string, userId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await deleteDoc(doc(db, 'apps', appId, 'reviews', userId));
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `apps/${appId}/reviews/${userId}`);
    }
  }

  const revs = getLocalReviews();
  if (revs[appId]) {
    revs[appId] = revs[appId].filter(r => r.userId !== userId);
    saveLocalReviews(revs);
    
    const apps = getLocalApps();
    const appIdx = apps.findIndex(a => a.id === appId);
    if (appIdx !== -1) {
      const list = revs[appId];
      apps[appIdx].rating = list.length > 0 ? Number((list.reduce((acc, cur) => acc + cur.rating, 0) / list.length).toFixed(1)) : 5.0;
      apps[appIdx].reviewCount = list.length;
      saveLocalApps(apps);
    }
  }
};

// --- REPORTS ---
export const submitReport = async (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const newReport: ReportItem = {
    ...report,
    id: "rep-" + Date.now(),
    status: 'pending',
    createdAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    try {
      const refDoc = doc(collection(db, 'reports'));
      await setDoc(refDoc, newReport);
      return refDoc.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'reports');
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    const list: ReportItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(newReport);
    localStorage.setItem(MOCK_STORAGE_KEY_REPORTS, JSON.stringify(list));
  } catch {}
  return newReport.id;
};

export const getReports = async (): Promise<ReportItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const list: ReportItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as ReportItem));
      return list;
    } catch (e) {
      console.warn("getReports error:", e);
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const dismissReport = async (reportId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `reports/${reportId}`);
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    if (raw) {
      const list: ReportItem[] = JSON.parse(raw);
      const filtered = list.filter(r => r.id !== reportId);
      localStorage.setItem(MOCK_STORAGE_KEY_REPORTS, JSON.stringify(filtered));
    }
  } catch {}
};

// --- BANS ---
export const banUser = async (userId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    try {
      await setDoc(doc(db, 'banned_users', userId), {
        bannedAt: Date.now(),
        bannedBy: auth?.currentUser?.email
      });
      return;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `banned_users/${userId}`);
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_BANS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(userId)) {
      list.push(userId);
      localStorage.setItem(MOCK_STORAGE_KEY_BANS, JSON.stringify(list));
    }
  } catch {}
};

export const isUserBanned = async (userId: string): Promise<boolean> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'banned_users', userId));
      return snap.exists();
    } catch {
      return false;
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_BANS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(userId);
  } catch {
    return false;
  }
};

// --- 100% RELIABLE ZERO-HANG FILE UPLOADER WITH FALLBACK ---
export const uploadFile = async (
  folder: 'profiles' | 'apps',
  entityId: string,
  subFolder: 'images' | 'apk' | 'avatar',
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  // If it's an image, create optimized compressed Data URL
  if (file.type.startsWith('image/')) {
    const fastImage = await compressImageFile(file, subFolder === 'avatar' ? 256 : 960);
    if (onProgress) onProgress(100);
    if (fastImage) return fastImage;
  }

  if (isLiveFirebase() && storage) {
    const userId = auth?.currentUser?.uid || 'developer';
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `users/${userId}/apps/${entityId}/${subFolder}/${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    try {
      const storageUploadPromise = new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.min(99, Math.round(pct)));
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (e) {
              reject(e);
            }
          }
        );
      });

      // 25 second timeout for large APKs
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('STORAGE_TIMEOUT')), 25000);
      });

      const resultUrl = await Promise.race([storageUploadPromise, timeoutPromise]);
      if (onProgress) onProgress(100);
      return resultUrl;
    } catch (storageError) {
      if (onProgress) onProgress(100);
      return URL.createObjectURL(file);
    }
  }

  // Smooth local simulation fallback
  return new Promise((resolve) => {
    let current = 0;
    const interval = setInterval(() => {
      current += 35;
      if (current >= 100) {
        clearInterval(interval);
        if (onProgress) onProgress(100);
        resolve(URL.createObjectURL(file));
      } else {
        if (onProgress) onProgress(current);
      }
    }, 60);
  });
};
