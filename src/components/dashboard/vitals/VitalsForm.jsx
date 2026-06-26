import { vitalFields } from "../../../services/vitalsService";
import { Field, PrimaryButton } from "../../ui";

export default function VitalsForm({ form, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {vitalFields.map(([name, label, type]) => (
        <Field
          key={name}
          label={label}
          type={type}
          step="0.1"
          min="0"
          value={form[name]}
          onChange={(event) => onChange({ ...form, [name]: event.target.value })}
        />
      ))}
      <PrimaryButton type="submit" className="sm:col-span-2 lg:col-span-4 lg:w-fit">
        Save today’s vitals
      </PrimaryButton>
    </form>
  );
}
