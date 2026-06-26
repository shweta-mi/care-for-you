import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "../services/storageService";

const EMPTY_COLLECTION = [];

export function useStoredCollection(key, fallback = EMPTY_COLLECTION) {
  const [items, setItems] = useState(() => readStorage(key, fallback));

  useEffect(() => {
    const sync = (event) => {
      if (!event.detail?.key || event.detail.key === key) {
        setItems(readStorage(key, fallback));
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("care-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("care-storage", sync);
    };
  }, [fallback, key]);

  const updateItems = useCallback(
    (nextValue) => {
      const current = readStorage(key, fallback);
      const next =
        typeof nextValue === "function" ? nextValue(current) : nextValue;
      writeStorage(key, next);
      setItems(next);
    },
    [fallback, key],
  );

  return [items, updateItems];
}
