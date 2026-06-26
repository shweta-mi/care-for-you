import { STORAGE_KEYS } from "../constants/storageKeys";
import { readStorage } from "../services/storageService";
import { daysAgo, toDateKey } from "./dateUtils";

const startOfPeriod = (period) => {
  const date = new Date();
  if (period === "daily") return toDateKey(date);
  if (period === "weekly") date.setDate(date.getDate() - 6);
  if (period === "monthly") date.setDate(date.getDate() - 29);
  return toDateKey(date);
};

const withinPeriod = (date, period) => date && date >= startOfPeriod(period);
const periodDays = (period) => (period === "daily" ? 1 : period === "weekly" ? 7 : 30);

const seriesFor = (period, mapper) =>
  Array.from({ length: periodDays(period) }, (_, index) => {
    const date = daysAgo(periodDays(period) - 1 - index);
    return mapper(date);
  });

export function buildCareReport({ caregiverId, receiverId, period }) {
  const pair = (item) =>
    item.caregiverId === caregiverId && item.receiverId === receiverId;
  const medicines = readStorage(STORAGE_KEYS.medicines).filter(pair);
  const medicineHistory = readStorage(STORAGE_KEYS.medicineHistory).filter(
    (item) => pair(item) && withinPeriod(item.date, period),
  );
  const meals = readStorage(STORAGE_KEYS.meals).filter(pair);
  const mealHistory = readStorage(STORAGE_KEYS.mealHistory).filter(
    (item) => pair(item) && withinPeriod(item.date, period),
  );
  const water = readStorage(STORAGE_KEYS.waterIntake).filter(
    (item) => pair(item) && withinPeriod(item.date, period),
  );
  const vitals = readStorage(STORAGE_KEYS.vitals).filter(
    (item) => pair(item) && withinPeriod(item.date, period),
  );
  const appointments = readStorage(STORAGE_KEYS.appointments).filter(
    (item) => pair(item) && withinPeriod(item.date, period),
  );
  const waterGoals = readStorage(STORAGE_KEYS.waterGoals);
  const waterGoal =
    waterGoals.find(pair)?.goal || waterGoals.find(pair)?.amount || 2000;
  const taken = medicineHistory.filter((item) => item.status === "taken").length;
  const tracked = medicineHistory.length;
  const skipped = medicineHistory.filter((item) => item.status === "skipped").length;
  const missed = medicineHistory.filter((item) => item.status === "missed").length;
  const completedMeals = mealHistory.filter((item) => item.completed).length;
  const waterTotal = water.reduce((sum, item) => sum + Number(item.amount), 0);
  const latestVitals = [...vitals].sort((a, b) =>
    b.createdAt?.localeCompare(a.createdAt),
  )[0];
  const completedAppointments = appointments.filter((item) => item.completed).length;
  const appointmentAttendance = appointments.length
    ? Math.round((completedAppointments / appointments.length) * 100)
    : 0;
  const dayCount = periodDays(period);
  const waterGoalCompletion = Math.round(
    (waterTotal / Math.max(1, waterGoal * dayCount)) * 100,
  );

  return {
    period,
    generatedAt: new Date().toISOString(),
    from: startOfPeriod(period),
    to: toDateKey(),
    medicine: {
      scheduled: medicines.length,
      tracked,
      taken,
      skipped,
      missed,
      completion: tracked ? Math.round((taken / tracked) * 100) : 0,
      takenPercent: tracked ? Math.round((taken / tracked) * 100) : 0,
      missedPercent: tracked ? Math.round((missed / tracked) * 100) : 0,
    },
    meals: {
      planned: meals.length,
      completed: completedMeals,
      completion: mealHistory.length
        ? Math.round((completedMeals / mealHistory.length) * 100)
        : 0,
    },
    water: {
      total: waterTotal,
      goal: waterGoal,
      goalCompletion: waterGoalCompletion,
      average: Math.round(waterTotal / dayCount),
    },
    health: {
      readings: vitals.length,
      latest: latestVitals || null,
      appointments: appointments.length,
      completedAppointments,
      appointmentAttendance,
    },
    analytics: {
      medicineStatus: [
        { label: "Taken", value: taken, color: "#10b981" },
        { label: "Skipped", value: skipped, color: "#f59e0b" },
        { label: "Missed", value: missed, color: "#ef4444" },
      ],
      completionBars: [
        { label: "Meds", value: tracked ? Math.round((taken / tracked) * 100) : 0 },
        { label: "Meals", value: mealHistory.length ? Math.round((completedMeals / mealHistory.length) * 100) : 0 },
        { label: "Water", value: Math.min(100, waterGoalCompletion) },
        { label: "Appts", value: appointmentAttendance },
      ],
      waterSeries: seriesFor(period, (date) => ({
        label: date.slice(5),
        value: water
          .filter((item) => item.date === date)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      })),
      vitalsSeries: seriesFor(period, (date) => {
        const reading = vitals.find((item) => item.date === date);
        return {
          label: date.slice(5),
          value: Number(reading?.heartRate || 0),
        };
      }),
    },
  };
}
