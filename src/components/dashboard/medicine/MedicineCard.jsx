import { formatTime } from "../../../utils/dateUtils";
import { PrimaryButton, SecondaryButton } from "../../ui";
import { statusStyles } from "./medicineStatusStyles";

export default function MedicineCard({
  medicine,
  status,
  userRole,
  onMarkTaken,
  onSkip,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5 transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-900/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-800">
              {medicine.medicineName}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[status]}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {medicine.dosage} · {formatTime(medicine.time)} ·{" "}
            {medicine.frequency}
          </p>
          {medicine.notes && (
            <p className="mt-2 text-sm text-slate-500">{medicine.notes}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {userRole === "receiver" ? (
            <>
              <PrimaryButton
                onClick={() => onMarkTaken(medicine)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Mark taken
              </PrimaryButton>
              <SecondaryButton onClick={() => onSkip(medicine)}>
                Skip
              </SecondaryButton>
            </>
          ) : (
            <>
              <SecondaryButton onClick={() => onEdit(medicine)}>
                Edit
              </SecondaryButton>
              <SecondaryButton
                onClick={() => onDelete(medicine.id)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Delete
              </SecondaryButton>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
