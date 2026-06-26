import { createId } from "./storageService";
import { daysAgo } from "../utils/dateUtils";

export const WaterService = {
  goalFor(goals, caregiverId, receiverId) {
    return goals.find(
      (item) =>
        item.caregiverId === caregiverId && item.receiverId === receiverId,
    );
  },

  goalAmount(goals, caregiverId, receiverId) {
    const record = this.goalFor(goals, caregiverId, receiverId);
    return record?.goal || record?.amount || 2000;
  },

  saveGoal(goals, caregiverId, receiverId, goal) {
    const numericGoal = Number(goal);
    if (!numericGoal || numericGoal < 250) return goals;
    const existing = this.goalFor(goals, caregiverId, receiverId);
    return [
      ...goals.filter(
        (item) =>
          !(
            item.caregiverId === caregiverId && item.receiverId === receiverId
          ),
      ),
      {
        id: existing?.id || createId(),
        caregiverId,
        receiverId,
        goal: numericGoal,
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  deleteGoal(goals, caregiverId, receiverId) {
    return goals.filter(
      (item) =>
        !(item.caregiverId === caregiverId && item.receiverId === receiverId),
    );
  },

  addIntake(intake, caregiverId, receiverId, amount, date, goal) {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return intake;
    return [
      ...intake,
      {
        id: createId(),
        caregiverId,
        receiverId,
        goal,
        amount: numericAmount,
        date,
        time: new Date().toISOString(),
      },
    ];
  },

  totalForDate(intake, receiverId, date) {
    return intake
      .filter((item) => item.receiverId === receiverId && item.date === date)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  },

  dailyEntries(intake, receiverId, date) {
    return intake.filter(
      (item) => item.receiverId === receiverId && item.date === date,
    );
  },

  weeklySummary(intake, receiverId, goal) {
    return Array.from({ length: 7 }, (_, index) => {
      const date = daysAgo(6 - index);
      const amount = this.totalForDate(intake, receiverId, date);
      return {
        date,
        amount,
        percentage: goal ? Math.round((amount / goal) * 100) : 0,
      };
    });
  },
};
