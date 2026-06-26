import { getFirebaseRuntime, isFirebaseConfigured } from "../firebase/firebaseConfig";
import { firebaseAuthService } from "../firebase/services/authService";
import { firebaseFirestoreService } from "../firebase/services/firestoreService";
import { firebaseStorageService } from "../firebase/services/storageService";

export { isFirebaseConfigured };

export async function initializeFirebase() {
  if (!isFirebaseConfigured) return null;
  try {
    const runtime = await getFirebaseRuntime();
    if (!runtime) return null;
    return {
      app: runtime.app,
      auth: runtime.auth,
      database: runtime.database,
      storage: runtime.storage,
      authentication: firebaseAuthService,
      collections: {
        set: firebaseFirestoreService.setCollection,
        get: firebaseFirestoreService.getCollection,
        subscribe: firebaseFirestoreService.subscribeCollection,
      },
      files: firebaseStorageService,
    };
  } catch (error) {
    console.warn("Firebase is configured but could not initialize.", error);
    return null;
  }
}
