import { formatDate, formatTime, toDateKey } from "../utils/dateUtils";

const categoryStyles = {
  medicine: "bg-violet-100 text-violet-700",
  meal: "bg-emerald-100 text-emerald-700",
  water: "bg-cyan-100 text-cyan-700",
  appointment: "bg-blue-100 text-blue-700",
  emergency: "bg-red-100 text-red-700",
};

const mealTime = (meal) => meal.time || meal.mealTime || "";
const mealName = (meal) => meal.mealName || meal.mealType || "Meal";

export const NotificationService = {
  categoryStyles,

  buildNotifications({
    storedNotifications = [],
    medicines = [],
    meals = [],
    appointments = [],
    emergencies = [],
    waterGoals = [],
    waterIntake = [],
    caregiverId,
    receiverId,
    user,
  }) {
    const today = toDateKey();
    const pair = (item) =>
      item.caregiverId === caregiverId && item.receiverId === receiverId;
    const waterGoal = waterGoals.find(pair)?.goal || waterGoals.find(pair)?.amount;
    const waterTotal = waterIntake
      .filter((item) => item.receiverId === receiverId && item.date === today)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const generated = [
      ...medicines.filter(pair).map((item) => ({
        id: `medicine-${item.id}-${today}`,
        type: "medicine",
        title: `${item.medicineName} reminder`,
        message: `${item.dosage} at ${formatTime(item.time)}`,
        timestamp: `${today}T${item.time || "00:00"}`,
      })),
      ...meals.filter(pair).map((item) => ({
        id: `meal-${item.id}-${today}`,
        type: "meal",
        title: `${mealName(item)} reminder`,
        message: `${formatTime(mealTime(item))}${item.notes ? ` · ${item.notes}` : ""}`,
        timestamp: `${today}T${mealTime(item) || "00:00"}`,
      })),
      ...(waterGoal && waterTotal < waterGoal
        ? [
            {
              id: `water-${receiverId}-${today}`,
              type: "water",
              title: "Water intake reminder",
              message: `${Math.max(waterGoal - waterTotal, 0)} ml remaining for today's goal`,
              timestamp: `${today}T18:00`,
            },
          ]
        : []),
      ...appointments
        .filter((item) => pair(item) && !item.completed && item.date >= today)
        .map((item) => ({
          id: `appointment-${item.id}`,
          type: "appointment",
          title: `Appointment with Dr. ${item.doctorName}`,
          message: `${item.hospital} · ${formatDate(item.date)} at ${formatTime(item.time)}`,
          timestamp: `${item.date}T${item.time}`,
        })),
      ...emergencies
        .filter(
          (item) =>
            pair(item) &&
            (user.role === "caregiver"
              ? item.caregiverId === user.id
              : item.senderId === user.id),
        )
        .map((item) => ({
          id: `emergency-${item.id}`,
          type: "emergency",
          title: "Emergency SOS alert",
          message: item.message,
          timestamp: item.timestamp,
        })),
    ];

    return [...storedNotifications, ...generated]
      .filter((item) => !item.deletedBy?.includes(user.id))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  readIds(reads, userId) {
    return reads
      .filter((item) => item.userId === userId)
      .map((item) => item.notificationId);
  },

  markRead(reads, userId, notificationId) {
    if (
      reads.some(
        (item) => item.userId === userId && item.notificationId === notificationId,
      )
    ) {
      return reads;
    }
    return [...reads, { userId, notificationId, readAt: new Date().toISOString() }];
  },

  markUnread(reads, userId, notificationId) {
    return reads.filter(
      (item) =>
        !(item.userId === userId && item.notificationId === notificationId),
    );
  },

  markAllRead(reads, userId, notifications) {
    return [
      ...reads.filter((item) => userId !== item.userId),
      ...notifications.map((item) => ({
        userId,
        notificationId: item.id,
        readAt: new Date().toISOString(),
      })),
    ];
  },

  deleteNotification(storedNotifications, notification, userId) {
    const existing = storedNotifications.find((item) => item.id === notification.id);
    if (existing) {
      return storedNotifications.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              deletedBy: Array.from(new Set([...(item.deletedBy || []), userId])),
            }
          : item,
      );
    }
    return [
      ...storedNotifications,
      {
        ...notification,
        deletedBy: [userId],
      },
    ];
  },

  latest(notifications, count = 3) {
    return notifications.slice(0, count);
  },
};
