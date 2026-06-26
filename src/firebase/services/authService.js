import { getFirebaseRuntime } from "../firebaseConfig";

export const firebaseAuthService = {
  async register(email, password) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) throw new Error("Firebase is not configured.");
    return runtime.authApi.createUserWithEmailAndPassword(
      runtime.auth,
      email,
      password,
    );
  },

  async login(email, password) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) throw new Error("Firebase is not configured.");
    return runtime.authApi.signInWithEmailAndPassword(
      runtime.auth,
      email,
      password,
    );
  },

  async logout() {
    const runtime = await getFirebaseRuntime();
    if (!runtime) return null;
    return runtime.authApi.signOut(runtime.auth);
  },

  async subscribe(callback) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) return () => {};
    return runtime.authApi.onAuthStateChanged(runtime.auth, callback);
  },
};
