import MealForm from "./MealForm";
import { Modal } from "../../ui";

export default function MealModal({
  open,
  form,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title="Edit meal"
      subtitle="Update this meal plan for your connected care receiver."
      onClose={onClose}
    >
      <MealForm
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Save changes"
      />
    </Modal>
  );
}
