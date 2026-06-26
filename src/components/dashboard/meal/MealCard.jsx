import { formatTime } from "../../../utils/dateUtils";
import { MealService } from "../../../services/mealService";
import { PrimaryButton, SecondaryButton } from "../../ui";

export default function MealCard({
  meal,
  completed,
  userRole,
  onComplete,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5 transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-900/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">
            {meal.mealType || MealService.mealTitle(meal)}
          </p>
          <h3 className="mt-1 font-bold text-slate-800">
            {MealService.mealTitle(meal)}
          </h3>
          <p className="text-sm text-slate-500">
            {formatTime(MealService.mealTime(meal))}
          </p>
          {meal.notes && (
            <p className="mt-2 text-sm text-slate-600">{meal.notes}</p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-pink-50 text-slate-500"
          }`}
        >
          {completed ? "Completed" : "Pending"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {userRole === "receiver" && !completed && (
          <PrimaryButton onClick={() => onComplete(meal)}>
            Mark completed
          </PrimaryButton>
        )}
        {userRole === "caregiver" && (
          <>
            <SecondaryButton onClick={() => onEdit(meal)}>Edit</SecondaryButton>
            <SecondaryButton
              onClick={() => onDelete(meal.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Delete
            </SecondaryButton>
          </>
        )}
      </div>
    </article>
  );
}
