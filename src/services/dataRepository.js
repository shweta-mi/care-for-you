import { readStorage, writeStorage } from "./storageService";
import { initializeFirebase, isFirebaseConfigured } from "./firebaseService";

export const localRepository = {
  get: (collection, fallback = []) => readStorage(collection, fallback),
  set: (collection, value) => writeStorage(collection, value),
  subscribe(collection, callback) {
    const sync = (event) => {
      if (!event.detail?.key || event.detail.key === collection) {
        callback(readStorage(collection));
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("care-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("care-storage", sync);
    };
  },
};

export const createFirebaseRepository = (userId) => ({
  async get(collection, fallback = []) {
    const firebase = await initializeFirebase();
    if (!firebase) return localRepository.get(collection, fallback);
    return firebase.collections.get(userId, collection, fallback);
  },
  async set(collection, value) {
    localRepository.set(collection, value);
    const firebase = await initializeFirebase();
    if (firebase) await firebase.collections.set(userId, collection, value);
  },
  subscribe(collection, callback) {
    let unsubscribeCloud = () => {};
    const unsubscribeLocal = localRepository.subscribe(collection, callback);
    initializeFirebase().then((firebase) => {
      if (firebase) {
        firebase.collections
          .subscribe(userId, collection, callback)
          .then((unsubscribe) => {
            unsubscribeCloud = unsubscribe;
          });
      }
    });
    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  },
});

export const getActiveRepository = (options = {}) => {
  if (options.userId && isFirebaseConfigured && options.preferCloud) {
    return createFirebaseRepository(options.userId);
  }
  return localRepository;
};
