export const toDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

export const formatTime = (value) => {
  if (!value) return "Not set";
  const [hours, minutes] = value.split(":");
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, Number(hours), Number(minutes)));
};

export const isPastTime = (time, date = new Date()) => {
  if (!time) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes < date.getHours() * 60 + date.getMinutes();
};

export const daysAgo = (value) => {
  const date = new Date();
  date.setDate(date.getDate() - value);
  return toDateKey(date);
};
