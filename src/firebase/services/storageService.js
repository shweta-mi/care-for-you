import { getFirebaseRuntime } from "../firebaseConfig";

export const firebaseStorageService = {
  async uploadProfileImage(userId, file) {
    const runtime = await getFirebaseRuntime();
    if (!runtime) throw new Error("Firebase is not configured.");
    const reference = runtime.storageApi.ref(
      runtime.storage,
      `profile-images/${userId}/${Date.now()}-${file.name}`,
    );
    await runtime.storageApi.uploadBytes(reference, file, {
      contentType: file.type,
    });
    return runtime.storageApi.getDownloadURL(reference);
  },
};
