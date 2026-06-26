export const readStorage = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("care-storage", { detail: { key } }));
};

export const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
