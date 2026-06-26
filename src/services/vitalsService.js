import { createId } from "./storageService";
import { daysAgo, toDateKey } from "../utils/dateUtils";

export const emptyVitalsForm = {
  weight: "",
  height: "",
  systolic: "",
  diastolic: "",
  heartRate: "",
  temperature: "",
  bloodSugar: "",
  oxygen: "",
};

export const vitalFields = [
  ["weight", "Weight (kg)", "number"],
  ["height", "Height (cm)", "number"],
  ["systolic", "BP systolic", "number"],
  ["diastolic", "BP diastolic", "number"],
  ["heartRate", "Heart rate (bpm)", "number"],
  ["temperature", "Temperature (°F)", "number"],
  ["bloodSugar", "Blood sugar (mg/dL)", "number"],
  ["oxygen", "Oxygen SpO₂ (%)", "number"],
];

export const VitalsService = {
  calculateBmi(weight, height) {
    const heightInMetres = Number(height) / 100;
    if (!Number(weight) || !heightInMetres) return null;
    return (Number(weight) / heightInMetres ** 2).toFixed(1);
  },

  forCarePair(vitals, caregiverId, receiverId) {
    return vitals
      .filter(
        (item) =>
          item.caregiverId === caregiverId && item.receiverId === receiverId,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  addRecord(items, form, caregiverId, receiverId) {
    return [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        ...form,
        bmi: this.calculateBmi(form.weight, form.height),
        date: toDateKey(),
        createdAt: new Date().toISOString(),
      },
    ];
  },

  entriesSince(records, days) {
    const start = daysAgo(days - 1);
    return records.filter((item) => item.date >= start);
  },

  monthly(records) {
    return this.entriesSince(records, 30);
  },
};
