import { createId } from "./storageService";

export const emptyMealForm = {
  mealName: "",
  mealType: "Breakfast",
  time: "",
  notes: "",
};

export const MealService = {
  mealTime(meal) {
    return meal.time || meal.mealTime || "";
  },

  mealTitle(meal) {
    return meal.mealName || meal.mealType;
  },

  forCarePair(meals, caregiverId, receiverId) {
    return meals
      .filter(
        (meal) =>
          meal.caregiverId === caregiverId && meal.receiverId === receiverId,
      )
      .sort((a, b) => this.mealTime(a).localeCompare(this.mealTime(b)));
  },

  toForm(meal) {
    return {
      mealName: meal.mealName || "",
      mealType: meal.mealType || meal.mealName || "Breakfast",
      time: this.mealTime(meal),
      notes: meal.notes || "",
    };
  },

  addMeal(items, form, caregiverId, receiverId) {
    return [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        mealName: form.mealName.trim(),
        mealType: form.mealType,
        time: form.time,
        notes: form.notes,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  updateMeal(items, mealId, form) {
    return items.map((meal) =>
      meal.id === mealId
        ? {
            ...meal,
            mealName: form.mealName.trim(),
            mealType: form.mealType,
            time: form.time,
            notes: form.notes,
          }
        : meal,
    );
  },

  removeMeal(items, mealId) {
    return items.filter((meal) => meal.id !== mealId);
  },

  removeHistoryForMeal(history, mealId) {
    return history.filter((item) => item.mealId !== mealId);
  },

  completedToday(mealHistory, mealId, date) {
    return mealHistory.some(
      (item) => item.mealId === mealId && item.date === date && item.completed,
    );
  },

  createCompletionRecord(meal, caregiverId, receiverId, date) {
    return {
      id: createId(),
      mealId: meal.id,
      caregiverId,
      receiverId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
    };
  },
};
