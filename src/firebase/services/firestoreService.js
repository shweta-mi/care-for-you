import { getFirebaseRuntime } from "../firebaseConfig";

const careDataDoc = (runtime, userId, collectionName) =>
  runtime.firestoreApi.doc(
    runtime.database,
    "users",
    userId,
    "careData",
    collectionName,
  );

export const firebaseFirestoreService = {
  async setCollection(userId, collectionName, value) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) throw new Error("Firebase is not configured.");
    return runtime.firestoreApi.setDoc(careDataDoc(runtime, userId, collectionName), {
      value,
      updatedAt: runtime.firestoreApi.serverTimestamp(),
    });
  },

  async getCollection(userId, collectionName, fallback = []) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) return fallback;
    const snapshot = await runtime.firestoreApi.getDoc(
      careDataDoc(runtime, userId, collectionName),
    );
    return snapshot.exists() ? snapshot.data().value : fallback;
  },

  async subscribeCollection(userId, collectionName, callback) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) return () => {};
    return runtime.firestoreApi.onSnapshot(
      careDataDoc(runtime, userId, collectionName),
      (snapshot) => callback(snapshot.exists() ? snapshot.data().value : []),
    );
  },
};
