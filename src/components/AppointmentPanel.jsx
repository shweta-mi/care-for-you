import { useMemo, useState } from "react";
import AppointmentCard from "./dashboard/appointment/AppointmentCard";
import AppointmentForm from "./dashboard/appointment/AppointmentForm";
import { EmptyState, SectionCard } from "./ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import {
  AppointmentService,
  emptyAppointmentForm,
} from "../services/appointmentService";
import { formatDate } from "../utils/dateUtils";
import { toDateKey } from "../utils/dateUtils";

export default function AppointmentPanel({ user, caregiverId, receiverId }) {
  const [appointments, setAppointments] = useStoredCollection(
    STORAGE_KEYS.appointments,
  );
  const [form, setForm] = useState(emptyAppointmentForm);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const today = toDateKey();
  const pairAppointments = useMemo(
    () =>
      AppointmentService.forCarePair(appointments, caregiverId, receiverId),
    [appointments, caregiverId, receiverId],
  );
  const upcoming = AppointmentService.upcoming(pairAppointments, today);
  const history = AppointmentService.completed(pairAppointments, today);

  const submitAppointment = (event) => {
    event.preventDefault();
    if (
      !form.doctorName.trim() ||
      !form.hospital.trim() ||
      !form.date ||
      !form.time
    ) {
      return;
    }

    if (editingAppointment) {
      setAppointments((items) =>
        AppointmentService.updateAppointment(items, editingAppointment.id, form),
      );
      setEditingAppointment(null);
    } else {
      setAppointments((items) =>
        AppointmentService.addAppointment(items, form, caregiverId, receiverId),
      );
    }
    setForm(emptyAppointmentForm);
  };

  const editAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setForm({
      doctorName: appointment.doctorName || "",
      hospital: appointment.hospital || "",
      department: appointment.department || "",
      reason: appointment.reason || "",
      date: appointment.date || "",
      time: appointment.time || "",
      notes: appointment.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingAppointment(null);
    setForm(emptyAppointmentForm);
  };

  const complete = (id) => {
    setAppointments((items) => AppointmentService.completeAppointment(items, id));
  };

  const deleteAppointment = (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    setAppointments((items) => AppointmentService.deleteAppointment(items, id));
  };

  return (
    <div className="space-y-6">
      {user.role === "caregiver" && (
        <SectionCard
          title={editingAppointment ? "Edit appointment" : "Schedule appointment"}
          subtitle="Keep doctor visits visible to both caregiver and receiver."
        >
          <AppointmentForm
            form={form}
            onChange={setForm}
            onSubmit={submitAppointment}
            onCancel={editingAppointment ? cancelEdit : null}
            minDate={today}
            submitLabel={
              editingAppointment ? "Save appointment" : "Schedule appointment"
            }
          />
        </SectionCard>
      )}

      <SectionCard title="Upcoming appointments" subtitle="Next visits at a glance.">
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.length === 0 && (
            <div className="md:col-span-2">
              <EmptyState>No upcoming appointments.</EmptyState>
            </div>
          )}
          {upcoming.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole={user.role}
              onComplete={complete}
              onEdit={editAppointment}
              onDelete={deleteAppointment}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Completed appointments" subtitle="Past and completed visits.">
        <div className="space-y-2">
          {history.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-wrap justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-semibold">
                Dr. {appointment.doctorName} · {appointment.hospital}
              </span>
              <span className="text-slate-500">
                {formatDate(appointment.date)}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <EmptyState>No completed appointments yet.</EmptyState>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
