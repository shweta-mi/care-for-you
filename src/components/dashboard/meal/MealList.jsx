import { EmptyState } from "../../ui";
import MealCard from "./MealCard";

export default function MealList({
  meals,
  userRole,
  isCompleted,
  onComplete,
  onEdit,
  onDelete,
}) {
  if (meals.length === 0) {
    return (
      <div className="md:col-span-2">
        <EmptyState>No meals planned yet.</EmptyState>
      </div>
    );
  }

  return meals.map((meal) => (
    <MealCard
      key={meal.id}
      meal={meal}
      completed={isCompleted(meal.id)}
      userRole={userRole}
      onComplete={onComplete}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));
}
