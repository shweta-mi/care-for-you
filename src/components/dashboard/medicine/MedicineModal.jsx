import MedicineForm from "./MedicineForm";
import { Modal } from "../../ui";

export default function MedicineModal({
  title,
  subtitle,
  open,
  form,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal open={open} title={title} subtitle={subtitle} onClose={onClose}>
      <MedicineForm
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Save changes"
      />
    </Modal>
  );
}
