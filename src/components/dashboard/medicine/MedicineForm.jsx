import { Field, PrimaryButton, SecondaryButton } from "../../ui";

export default function MedicineForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Add medicine",
}) {
  const updateField = (field) => (event) => {
    onChange({ ...form, [field]: event.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <Field
        label="Medicine name"
        value={form.medicineName}
        onChange={updateField("medicineName")}
        placeholder="e.g. Metformin"
        required
      />
      <Field
        label="Dosage"
        value={form.dosage}
        onChange={updateField("dosage")}
        placeholder="e.g. 500 mg"
        required
      />
      <Field
        label="Time"
        type="time"
        value={form.time}
        onChange={updateField("time")}
        required
      />
      <Field
        label="Frequency"
        as="select"
        value={form.frequency}
        onChange={updateField("frequency")}
      >
        <option>Daily</option>
        <option>Twice a Day</option>
        <option>Weekly</option>
        <option>As Needed</option>
      </Field>
      <Field
        label="Notes"
        as="textarea"
        rows="3"
        value={form.notes}
        onChange={updateField("notes")}
        placeholder="With food, after breakfast..."
        className="md:col-span-2"
      />
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
