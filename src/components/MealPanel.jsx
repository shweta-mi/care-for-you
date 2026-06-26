import { useMemo, useState } from "react";
import MealForm from "./dashboard/meal/MealForm";
import MealList from "./dashboard/meal/MealList";
import MealModal from "./dashboard/meal/MealModal";
import { EmptyState, SectionCard } from "./ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { emptyMealForm, MealService } from "../services/mealService";
import { toDateKey } from "../utils/dateUtils";

export default function MealPanel({ user, caregiverId, receiverId }) {
  const [meals, setMeals] = useStoredCollection(STORAGE_KEYS.meals);
  const [mealHistory, setMealHistory] = useStoredCollection(
    STORAGE_KEYS.mealHistory,
  );
  const [form, setForm] = useState(emptyMealForm);
  const [editingMeal, setEditingMeal] = useState(null);
  const today = toDateKey();

  const pairMeals = useMemo(
    () => MealService.forCarePair(meals, caregiverId, receiverId),
    [caregiverId, meals, receiverId],
  );

  const pairMealHistory = mealHistory.filter(
    (item) =>
      item.caregiverId === caregiverId && item.receiverId === receiverId,
  );

  const isCompleted = (mealId) =>
    MealService.completedToday(mealHistory, mealId, today);

  const addMeal = (event) => {
    event.preventDefault();
    if (!form.mealName.trim() || !form.time) return;

    setMeals((items) =>
      MealService.addMeal(items, form, caregiverId, receiverId),
    );
    setForm(emptyMealForm);
  };

  const openEditor = (meal) => {
    setEditingMeal(meal);
    setForm(MealService.toForm(meal));
  };

  const closeEditor = () => {
    setEditingMeal(null);
    setForm(emptyMealForm);
  };

  const updateMeal = (event) => {
    event.preventDefault();
    if (!editingMeal || !form.mealName.trim() || !form.time) return;

    setMeals((items) => MealService.updateMeal(items, editingMeal.id, form));
    closeEditor();
  };

  const deleteMeal = (mealId) => {
    if (!window.confirm("Delete this meal and its completion history?")) return;
    setMeals((items) => MealService.removeMeal(items, mealId));
    setMealHistory((items) => MealService.removeHistoryForMeal(items, mealId));
  };

  const completeMeal = (meal) => {
    const record = MealService.createCompletionRecord(
      meal,
      caregiverId,
      receiverId,
      today,
    );

    setMealHistory((items) => [
      ...items.filter(
        (item) => !(item.mealId === meal.id && item.date === today),
      ),
      record,
    ]);
  };

  return (
    <div className="space-y-6">
      {user.role === "caregiver" && (
        <SectionCard
          title="Plan a meal"
          subtitle="Add breakfast, lunch, dinner, or snack reminders."
        >
          <MealForm form={form} onChange={setForm} onSubmit={addMeal} />
        </SectionCard>
      )}

      <SectionCard title="Today’s meals" subtitle="Your nutrition plan for today.">
        <div className="grid gap-3 md:grid-cols-2">
          <MealList
            meals={pairMeals}
            userRole={user.role}
            isCompleted={isCompleted}
            onComplete={completeMeal}
            onEdit={openEditor}
            onDelete={deleteMeal}
          />
        </div>
      </SectionCard>

      <SectionCard title="Meal history" subtitle="Recent completed meals.">
        <div className="space-y-2">
          {pairMealHistory
            .slice(-7)
            .reverse()
            .map((item) => {
              const meal = meals.find((entry) => entry.id === item.mealId);
              return (
                <div
                  key={item.id}
                  className="flex justify-between rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 text-sm shadow-sm shadow-pink-900/5"
                >
                  <span className="font-semibold">
                    {meal ? MealService.mealTitle(meal) : "Deleted meal"}
                  </span>
                  <span className="text-slate-500">{item.date}</span>
                </div>
              );
            })}
          {pairMealHistory.length === 0 && (
            <EmptyState>No completed meals yet.</EmptyState>
          )}
        </div>
      </SectionCard>

      <MealModal
        open={Boolean(editingMeal)}
        form={form}
        onChange={setForm}
        onSubmit={updateMeal}
        onClose={closeEditor}
      />
    </div>
  );
}
