import { formatTime } from "../../../utils/dateUtils";
import { EmptyState } from "../../ui";

export default function MedicineReminderCards({
  upcomingMedicines,
  missedMedicines,
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-[1.35rem] border border-pink-100 bg-pink-50/70 p-4">
        <p className="text-sm font-bold text-slate-800">Upcoming medicines</p>
        <div className="mt-3 space-y-2">
          {upcomingMedicines.length === 0 && (
            <EmptyState>No upcoming medicines left today.</EmptyState>
          )}
          {upcomingMedicines.slice(0, 4).map((medicine) => (
            <div
              key={medicine.id}
              className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm shadow-sm shadow-pink-900/5"
            >
              <span className="font-semibold text-slate-700">
                {medicine.medicineName}
              </span>
              <span className="text-slate-500">{formatTime(medicine.time)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-red-100 bg-red-50/70 p-4">
        <p className="text-sm font-bold text-slate-800">Missed medicines</p>
        <div className="mt-3 space-y-2">
          {missedMedicines.length === 0 && (
            <EmptyState>No missed medicines right now.</EmptyState>
          )}
          {missedMedicines.slice(0, 4).map((medicine) => (
            <div
              key={medicine.id}
              className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm shadow-sm shadow-red-900/5"
            >
              <span className="font-semibold text-slate-700">
                {medicine.medicineName}
              </span>
              <span className="text-red-600">{formatTime(medicine.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
