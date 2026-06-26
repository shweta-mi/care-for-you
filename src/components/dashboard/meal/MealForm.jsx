import { Field, PrimaryButton, SecondaryButton } from "../../ui";

export default function MealForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Add meal",
}) {
  const updateField = (field) => (event) => {
    onChange({ ...form, [field]: event.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <Field
        label="Meal name"
        value={form.mealName}
        onChange={updateField("mealName")}
        placeholder="e.g. Oats with fruit"
        required
      />
      <Field
        label="Meal type"
        as="select"
        value={form.mealType}
        onChange={updateField("mealType")}
      >
        <option>Breakfast</option>
        <option>Lunch</option>
        <option>Dinner</option>
        <option>Snacks</option>
      </Field>
      <Field
        label="Time"
        type="time"
        value={form.time}
        onChange={updateField("time")}
        required
      />
      <Field
        label="Notes"
        value={form.notes}
        onChange={updateField("notes")}
        placeholder="Food details"
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
