export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let runtimePromise;

export async function getFirebaseRuntime() {
  if (!isFirebaseConfigured) return null;
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    const [appApi, authApi, firestoreApi, storageApi] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
      import("firebase/firestore"),
      import("firebase/storage"),
    ]);
    const app = appApi.getApps().length
      ? appApi.getApp()
      : appApi.initializeApp(firebaseConfig);
    const auth = authApi.getAuth(app);
    const database = firestoreApi.initializeFirestore(app, {
      localCache: firestoreApi.persistentLocalCache({
        tabManager: firestoreApi.persistentMultipleTabManager(),
      }),
    });
    const storage = storageApi.getStorage(app);

    return {
      app,
      auth,
      database,
      storage,
      authApi,
      firestoreApi,
      storageApi,
    };
  })();

  return runtimePromise;
}
