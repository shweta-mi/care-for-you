import { formatDate, formatTime } from "../../../utils/dateUtils";
import { PrimaryButton, SecondaryButton } from "../../ui";

export default function AppointmentCard({
  appointment,
  userRole,
  onComplete,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5 transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-900/10">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">
        {formatDate(appointment.date)} · {formatTime(appointment.time)}
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-800">
        Dr. {appointment.doctorName}
      </h3>
      <p className="text-sm font-semibold text-slate-600">
        {appointment.hospital}
        {appointment.department ? ` · ${appointment.department}` : ""}
      </p>
      {appointment.reason && (
        <p className="mt-2 text-sm text-slate-500">{appointment.reason}</p>
      )}
      {appointment.notes && (
        <p className="mt-1 text-sm text-slate-500">{appointment.notes}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {userRole === "receiver" && !appointment.completed && (
          <PrimaryButton onClick={() => onComplete(appointment.id)}>
            Mark completed
          </PrimaryButton>
        )}
        {userRole === "caregiver" && (
          <>
            <SecondaryButton onClick={() => onEdit(appointment)}>
              Edit
            </SecondaryButton>
            <SecondaryButton
              onClick={() => onDelete(appointment.id)}
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
