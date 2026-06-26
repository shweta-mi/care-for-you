import { useEffect, useMemo, useState } from "react";
import MedicineForm from "./dashboard/medicine/MedicineForm";
import MedicineList from "./dashboard/medicine/MedicineList";
import MedicineModal from "./dashboard/medicine/MedicineModal";
import MedicineReminderCards from "./dashboard/medicine/MedicineReminderCards";
import { statusStyles } from "./dashboard/medicine/medicineStatusStyles";
import {
  EmptyState,
  ProgressBar,
  SecondaryButton,
  SectionCard,
  StatCard,
} from "./ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import {
  emptyMedicineForm,
  MedicineService,
} from "../services/medicineService";
import { toDateKey } from "../utils/dateUtils";

export default function MedicinePanel({ user, caregiverId, receiverId }) {
  const [medicines, setMedicines] = useStoredCollection(STORAGE_KEYS.medicines);
  const [history, setHistory] = useStoredCollection(
    STORAGE_KEYS.medicineHistory,
  );
  const [reminderHistory, setReminderHistory] = useStoredCollection(
    STORAGE_KEYS.reminderHistory,
  );
  const [form, setForm] = useState(emptyMedicineForm);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported",
  );
  const today = toDateKey();

  const pairMedicines = useMemo(
    () => MedicineService.forCarePair(medicines, caregiverId, receiverId),
    [caregiverId, medicines, receiverId],
  );

  const todayHistory = useMemo(
    () =>
      history.filter(
        (item) =>
          item.caregiverId === caregiverId &&
          item.receiverId === receiverId &&
          item.date === today,
      ),
    [caregiverId, history, receiverId, today],
  );

  const { counts, completion } = useMemo(
    () => MedicineService.progressFor(pairMedicines, todayHistory),
    [pairMedicines, todayHistory],
  );

  const upcomingMedicines = useMemo(
    () => MedicineService.upcomingMedicines(pairMedicines, todayHistory),
    [pairMedicines, todayHistory],
  );

  const missedMedicines = useMemo(
    () => MedicineService.missedMedicines(pairMedicines, todayHistory),
    [pairMedicines, todayHistory],
  );

  const getStatus = (medicine) =>
    MedicineService.statusFor(medicine, todayHistory);

  useEffect(() => {
    if (
      user.role !== "receiver" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return undefined;
    }

    const checkReminders = () => {
      const now = new Date();
      pairMedicines.forEach((medicine) => {
        const [hours, minutes] = medicine.time.split(":").map(Number);
        const due =
          now.getHours() === hours &&
          now.getMinutes() >= minutes &&
          now.getMinutes() <= minutes + 1;
        const alreadySent = reminderHistory.some(
          (item) =>
            item.medicineId === medicine.id &&
            item.date === today &&
            item.type === "due",
        );
        const handled = todayHistory.some(
          (item) => item.medicineId === medicine.id,
        );

        if (due && !alreadySent && !handled) {
          new Notification(`Time for ${medicine.medicineName}`, {
            body: `${medicine.dosage} · ${medicine.notes || "Take as prescribed"}`,
          });
          setReminderHistory((items) => [
            ...items,
            MedicineService.createReminderRecord(medicine, receiverId, today),
          ]);
        }
      });
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 60000);
    return () => window.clearInterval(timer);
  }, [
    pairMedicines,
    receiverId,
    reminderHistory,
    setReminderHistory,
    today,
    todayHistory,
    user.role,
  ]);

  const submitMedicine = (event) => {
    event.preventDefault();
    if (!form.medicineName.trim() || !form.dosage.trim() || !form.time) return;

    setMedicines((items) =>
      MedicineService.addMedicine(items, form, caregiverId, receiverId),
    );
    setForm(emptyMedicineForm);
  };

  const submitEditedMedicine = (event) => {
    event.preventDefault();
    if (
      !editingMedicine ||
      !form.medicineName.trim() ||
      !form.dosage.trim() ||
      !form.time
    ) {
      return;
    }

    setMedicines((items) =>
      MedicineService.updateMedicine(items, editingMedicine.id, form),
    );
    closeEditor();
  };

  const openEditor = (medicine) => {
    setEditingMedicine(medicine);
    setForm(MedicineService.toForm(medicine));
  };

  const closeEditor = () => {
    setEditingMedicine(null);
    setForm(emptyMedicineForm);
  };

  const deleteMedicine = (id) => {
    if (!window.confirm("Delete this medicine and its tracking history?")) return;
    setMedicines((items) => MedicineService.removeMedicine(items, id));
    setHistory((items) => MedicineService.removeHistoryForMedicine(items, id));
  };

  const setStatus = (medicine, status) => {
    const record = MedicineService.createHistoryRecord(
      medicine,
      status,
      caregiverId,
      receiverId,
      today,
    );

    setHistory((items) => [
      ...items.filter(
        (item) =>
          !(item.medicineId === medicine.id && item.date === today),
      ),
      record,
    ]);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const pairHistory = history.filter(
    (item) =>
      item.caregiverId === caregiverId && item.receiverId === receiverId,
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Today’s medicine progress"
        subtitle="A live view of today’s care plan."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Total" value={pairMedicines.length} />
          <StatCard label="Taken" value={counts.taken} accent="text-emerald-600" />
          <StatCard label="Pending" value={counts.pending} />
          <StatCard label="Skipped" value={counts.skipped} accent="text-amber-600" />
          <StatCard label="Missed" value={counts.missed} accent="text-red-600" />
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Completion</span>
          <span className="font-semibold text-pink-700">{completion}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={completion} color="bg-emerald-500" />
        </div>
      </SectionCard>

      <SectionCard
        title="Reminders"
        subtitle={
          notificationPermission === "granted"
            ? "Browser reminders are enabled for due medicines."
            : "Enable browser notifications to receive medicine reminders."
        }
        action={
          user.role === "receiver" && notificationPermission !== "unsupported" ? (
            <SecondaryButton onClick={requestNotifications}>
              {notificationPermission === "granted"
                ? "Notifications enabled"
                : "Enable reminders"}
            </SecondaryButton>
          ) : null
        }
      >
        <MedicineReminderCards
          upcomingMedicines={upcomingMedicines}
          missedMedicines={missedMedicines}
        />
      </SectionCard>

      {user.role === "caregiver" && (
        <SectionCard
          title="Add medicine"
          subtitle="Create a schedule for your connected care receiver."
        >
          <MedicineForm
            form={form}
            onChange={setForm}
            onSubmit={submitMedicine}
          />
        </SectionCard>
      )}

      <SectionCard
        title="Today’s schedule"
        subtitle={
          user.role === "receiver"
            ? "Mark each dose after you take or skip it."
            : "Only the receiver can update medicine status."
        }
      >
        <MedicineList
          medicines={pairMedicines}
          userRole={user.role}
          getStatus={getStatus}
          onMarkTaken={(medicine) => setStatus(medicine, "taken")}
          onSkip={(medicine) => setStatus(medicine, "skipped")}
          onEdit={openEditor}
          onDelete={deleteMedicine}
        />
      </SectionCard>

      <SectionCard
        title="Medicine history"
        subtitle="The seven most recent tracking updates."
      >
        <div className="space-y-2">
          {pairHistory
            .slice(-7)
            .reverse()
            .map((item, index) => {
              const medicine = medicines.find(
                (entry) => entry.id === item.medicineId,
              );
              return (
                <div
                  key={item.id || `${item.medicineId}-${item.date}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 text-sm shadow-sm shadow-pink-900/5"
                >
                  <span className="font-semibold text-slate-700">
                    {medicine?.medicineName || "Deleted medicine"} · {item.date}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          {pairHistory.length === 0 && <EmptyState>No medicine history yet.</EmptyState>}
        </div>
      </SectionCard>

      <SectionCard
        title="Reminder history"
        subtitle="The seven most recent medicine reminders sent by this browser."
      >
        <div className="space-y-2">
          {reminderHistory
            .filter((item) => item.receiverId === receiverId)
            .slice(-7)
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 text-sm shadow-sm shadow-pink-900/5"
              >
                <span className="font-semibold text-slate-700">
                  {MedicineService.reminderLabel(item, medicines)}
                </span>
                <span className="capitalize text-slate-500">{item.type}</span>
              </div>
            ))}
          {!reminderHistory.some((item) => item.receiverId === receiverId) && (
            <EmptyState>No reminder history yet.</EmptyState>
          )}
        </div>
      </SectionCard>

      <MedicineModal
        open={Boolean(editingMedicine)}
        title="Edit medicine"
        subtitle="Update this schedule for your connected care receiver."
        form={form}
        onChange={setForm}
        onSubmit={submitEditedMedicine}
        onClose={closeEditor}
      />
    </div>
  );
}
