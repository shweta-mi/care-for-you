import { toDateKey } from "./dateUtils";

export const isCarePairItem = (item, caregiverId, receiverId) =>
  item.caregiverId === caregiverId && item.receiverId === receiverId;

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "";

export const formatShortDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }) : "";

export const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateKey(date);
};

export const uniqueDateCount = (items, field = "date") =>
  new Set(items.map((item) => item[field]).filter(Boolean)).size;
