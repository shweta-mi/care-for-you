import { createId } from "./storageService";

export const EmergencyService = {
  forCarePair(emergencies, caregiverId, receiverId) {
    return emergencies
      .filter(
        (item) =>
          item.caregiverId === caregiverId && item.receiverId === receiverId,
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  createSos(user, caregiverId, receiverId, message) {
    return {
      id: createId(),
      senderId: user.id,
      receiverId,
      caregiverId,
      message:
        message ||
        `${user.fullName} needs urgent assistance. Please check in immediately.`,
      timestamp: new Date().toISOString(),
      status: "active",
    };
  },

  resolve(emergencies, id) {
    return emergencies.map((item) =>
      item.id === id
        ? { ...item, status: "resolved", resolvedAt: new Date().toISOString() }
        : item,
    );
  },
};
