import { useState } from "react";
import { Field, PrimaryButton, SecondaryButton } from "../../ui";

export default function WaterGoalForm({ goal, onSave, onDelete }) {
  const [value, setValue] = useState(goal);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(value);
      }}
      className="grid gap-4 sm:grid-cols-[1fr_auto_auto]"
    >
      <Field
        label="Daily water goal"
        type="number"
        min="250"
        step="250"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <PrimaryButton type="submit" className="self-end">
        Save goal
      </PrimaryButton>
      <SecondaryButton
        type="button"
        onClick={onDelete}
        className="self-end border-red-200 text-red-600 hover:bg-red-50"
      >
        Delete goal
      </SecondaryButton>
    </form>
  );
}
