import { Field, PrimaryButton, SecondaryButton } from "../../ui";

export default function AppointmentForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  minDate,
  submitLabel = "Schedule appointment",
}) {
  const updateField = (field) => (event) => {
    onChange({ ...form, [field]: event.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <Field label="Doctor name" value={form.doctorName} onChange={updateField("doctorName")} required />
      <Field label="Hospital" value={form.hospital} onChange={updateField("hospital")} required />
      <Field label="Department" value={form.department} onChange={updateField("department")} placeholder="Cardiology, General..." />
      <Field label="Reason" value={form.reason} onChange={updateField("reason")} placeholder="Routine check-up, follow-up..." />
      <Field label="Date" type="date" min={minDate} value={form.date} onChange={updateField("date")} required />
      <Field label="Time" type="time" value={form.time} onChange={updateField("time")} required />
      <Field label="Notes" as="textarea" rows="3" value={form.notes} onChange={updateField("notes")} className="md:col-span-2" />
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
        {onCancel && (
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        )}
      </div>
    </form>
  );
}
