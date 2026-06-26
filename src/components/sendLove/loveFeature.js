import { createId } from "../../services/storageService";

export const quickTemplates = [
  "Thinking of You",
  "Take Care",
  "Don't Skip Your Medicine",
  "Have a Wonderful Day",
  "Stay Strong",
  "I Believe in You",
  "Drink Some Water",
  "Sleep Well",
  "Get Well Soon",
  "Love You",
];

export const loveCards = [
  {
    id: "thinking",
    title: "Thinking of You",
    caption: "A quiet reminder that you are deeply loved.",
    gradient: "from-pink-500 via-rose-400 to-fuchsia-500",
  },
  {
    id: "energy",
    title: "Sending Positive Energy",
    caption: "Soft courage for the next small step.",
    gradient: "from-rose-400 via-pink-400 to-orange-300",
  },
  {
    id: "little-love",
    title: "A Little Love From Me",
    caption: "Saved here for whenever you need it.",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-400",
  },
  {
    id: "great",
    title: "You're Doing Great",
    caption: "Even today. Especially today.",
    gradient: "from-pink-400 via-rose-300 to-amber-200",
  },
  {
    id: "strong",
    title: "Stay Strong",
    caption: "You are not doing this alone.",
    gradient: "from-rose-500 via-pink-500 to-purple-400",
  },
  {
    id: "beautiful",
    title: "Today Will Be Beautiful",
    caption: "May the day be gentle with you.",
    gradient: "from-pink-400 via-fuchsia-300 to-rose-300",
  },
];

export const aiLoveSuggestions = [
  "I'm proud of you.",
  "You are stronger than you think.",
  "I hope today brings you peace.",
  "I'm always with you.",
  "Take your medicine and smile.",
  "One small step today is enough.",
];

export const createLoveMessage = ({
  caregiverId,
  receiverId,
  message,
  card,
  voice,
  photo,
}) => ({
  id: createId(),
  caregiverId,
  receiverId,
  message: message?.trim() || "Thinking of You",
  card: card || loveCards[0],
  voice: voice || null,
  photo: photo || null,
  viewed: false,
  favorite: false,
  createdAt: new Date().toISOString(),
});

export const visibleForPair = (messages, caregiverId, receiverId) =>
  messages
    .filter(
      (item) =>
        item.caregiverId === caregiverId && item.receiverId === receiverId,
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const unviewedForReceiver = (messages, receiverId) =>
  messages
    .filter((item) => item.receiverId === receiverId && !item.viewed)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
