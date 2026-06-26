import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { NotificationService } from "../services/notificationService";
import useApp from "./useApp";
import { useStoredCollection } from "./useStoredCollection";

export default function useUnreadNotifications(user, caregiverId, receiverId) {
  const { settings } = useApp();
  const [reads] = useStoredCollection(STORAGE_KEYS.notificationReads);
  const [storedNotifications] = useStoredCollection(STORAGE_KEYS.notifications);
  const [medicines] = useStoredCollection(STORAGE_KEYS.medicines);
  const [meals] = useStoredCollection(STORAGE_KEYS.meals);
  const [waterGoals] = useStoredCollection(STORAGE_KEYS.waterGoals);
  const [waterIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const [appointments] = useStoredCollection(STORAGE_KEYS.appointments);
  const [emergencies] = useStoredCollection(STORAGE_KEYS.emergencies);

  return useMemo(() => {
    if (!caregiverId || !receiverId) return 0;
    const enabled = settings.notifications || {};
    const notifications = NotificationService.buildNotifications({
      storedNotifications,
      medicines,
      meals,
      waterGoals,
      waterIntake,
      appointments,
      emergencies,
      caregiverId,
      receiverId,
      user,
    }).filter((item) => enabled[item.type] !== false);
    const readIds = new Set(
      NotificationService.readIds(reads, user.id),
    );
    return notifications.filter((item) => !readIds.has(item.id)).length;
  }, [
    appointments,
    caregiverId,
    emergencies,
    meals,
    medicines,
    reads,
    receiverId,
    storedNotifications,
    user,
    settings.notifications,
    waterGoals,
    waterIntake,
  ]);
}
