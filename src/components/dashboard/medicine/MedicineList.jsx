import { EmptyState } from "../../ui";
import MedicineCard from "./MedicineCard";

export default function MedicineList({
  medicines,
  userRole,
  getStatus,
  onMarkTaken,
  onSkip,
  onEdit,
  onDelete,
}) {
  if (medicines.length === 0) {
    return <EmptyState>No medicines have been added yet.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {medicines.map((medicine) => (
        <MedicineCard
          key={medicine.id}
          medicine={medicine}
          status={getStatus(medicine)}
          userRole={userRole}
          onMarkTaken={onMarkTaken}
          onSkip={onSkip}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
