import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import {
  initializeFirebase,
  isFirebaseConfigured,
} from "../services/firebaseService";
import { readStorage, writeStorage } from "../services/storageService";
import { AppContext } from "./AppContext";

export default function AppProvider({ children }) {
  const [user, setUserState] = useState(() => readStorage("user", null));
  const [settings, setSettings] = useState(() =>
    readStorage(STORAGE_KEYS.settings, { theme: "light" }),
  );
  const [firebase, setFirebase] = useState(null);

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    if (nextUser) writeStorage("user", nextUser);
    else localStorage.removeItem("user");
  }, []);

  const updateSettings = useCallback((next) => {
    setSettings((current) => {
      const value = typeof next === "function" ? next(current) : next;
      writeStorage(STORAGE_KEYS.settings, value);
      return value;
    });
  }, []);

  useEffect(() => {
    const personalization = settings.personalization || {};
    const theme = personalization.theme || settings.theme || "light";
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.cardStyle = personalization.cardStyle || "glass";
    root.dataset.galleryBackground = personalization.galleryBackground || "blush";
    root.dataset.animations =
      personalization.animationsEnabled === false ? "off" : "on";
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    root.style.setProperty("--brand", personalization.accentColor || "#ec4899");
    root.style.setProperty("--care-radius", `${personalization.borderRadius || 24}px`);
    root.style.setProperty(
      "--care-radius-lg",
      `${Math.max((personalization.borderRadius || 24) + 4, 12)}px`,
    );
    root.style.setProperty("--care-font-size", `${personalization.fontSize || 16}px`);
    root.style.setProperty(
      "--care-motion-factor",
      `${personalization.animationsEnabled === false ? 0 : (personalization.animationIntensity ?? 70) / 70}`,
    );
  }, [settings]);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let active = true;
    initializeFirebase().then((runtime) => {
      if (active) setFirebase(runtime);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      settings,
      updateSettings,
      firebase,
      firebaseConfigured: isFirebaseConfigured,
    }),
    [firebase, setUser, settings, updateSettings, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
