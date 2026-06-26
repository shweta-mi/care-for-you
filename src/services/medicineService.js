import { createId } from "./storageService";
import { formatTime, isPastTime } from "../utils/dateUtils";

export const emptyMedicineForm = {
  medicineName: "",
  dosage: "",
  frequency: "Daily",
  time: "",
  notes: "",
};

export const MedicineService = {
  forCarePair(medicines, caregiverId, receiverId) {
    return medicines
      .filter(
        (item) =>
          item.caregiverId === caregiverId && item.receiverId === receiverId,
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  statusFor(medicine, todayHistory) {
    const record = todayHistory.find((item) => item.medicineId === medicine.id);
    if (record) return record.status;
    return isPastTime(medicine.time) ? "missed" : "pending";
  },

  upcomingMedicines(medicines, todayHistory) {
    return medicines.filter(
      (medicine) => this.statusFor(medicine, todayHistory) === "pending",
    );
  },

  missedMedicines(medicines, todayHistory) {
    return medicines.filter(
      (medicine) => this.statusFor(medicine, todayHistory) === "missed",
    );
  },

  progressFor(medicines, todayHistory) {
    const counts = medicines.reduce(
      (acc, medicine) => {
        acc[this.statusFor(medicine, todayHistory)] += 1;
        return acc;
      },
      { taken: 0, skipped: 0, pending: 0, missed: 0 },
    );

    return {
      counts,
      completion: medicines.length
        ? Math.round((counts.taken / medicines.length) * 100)
        : 0,
    };
  },

  toForm(medicine) {
    return {
      medicineName: medicine.medicineName,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      time: medicine.time,
      notes: medicine.notes || "",
    };
  },

  addMedicine(items, form, caregiverId, receiverId) {
    return [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        ...form,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  updateMedicine(items, medicineId, form) {
    return items.map((item) =>
      item.id === medicineId ? { ...item, ...form } : item,
    );
  },

  removeMedicine(items, medicineId) {
    return items.filter((item) => item.id !== medicineId);
  },

  removeHistoryForMedicine(history, medicineId) {
    return history.filter((item) => item.medicineId !== medicineId);
  },

  createHistoryRecord(medicine, status, caregiverId, receiverId, date) {
    return {
      id: createId(),
      medicineId: medicine.id,
      receiverId,
      caregiverId,
      status,
      takenTime: status === "taken" ? new Date().toISOString() : null,
      date,
    };
  },

  createReminderRecord(medicine, receiverId, date, type = "due") {
    return {
      id: createId(),
      medicineId: medicine.id,
      receiverId,
      date,
      type,
      sentAt: new Date().toISOString(),
    };
  },

  reminderLabel(reminder, medicines) {
    const medicine = medicines.find((item) => item.id === reminder.medicineId);
    if (!medicine) return "Deleted medicine";
    return `${medicine.medicineName} at ${formatTime(medicine.time)}`;
  },
};
