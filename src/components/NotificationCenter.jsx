import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import useApp from "../hooks/useApp";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { NotificationService } from "../services/notificationService";
import { EmptyState, SecondaryButton, SectionCard, StatCard } from "./ui";

const categoryStyles = {
  medicine: "bg-pink-100 text-pink-700",
  meal: "bg-emerald-100 text-emerald-700",
  water: "bg-cyan-100 text-cyan-700",
  appointment: "bg-pink-100 text-pink-700",
  emergency: "bg-red-100 text-red-700",
};

export default function NotificationCenter({
  user,
  caregiverId,
  receiverId,
}) {
  const { settings } = useApp();
  const [reads, setReads] = useStoredCollection(STORAGE_KEYS.notificationReads);
  const [storedNotifications, setStoredNotifications] = useStoredCollection(
    STORAGE_KEYS.notifications,
  );
  const [medicines] = useStoredCollection(STORAGE_KEYS.medicines);
  const [meals] = useStoredCollection(STORAGE_KEYS.meals);
  const [waterGoals] = useStoredCollection(STORAGE_KEYS.waterGoals);
  const [waterIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const [appointments] = useStoredCollection(STORAGE_KEYS.appointments);
  const [emergencies] = useStoredCollection(STORAGE_KEYS.emergencies);
  const [category, setCategory] = useStoredCollection("notificationCategory", "all");

  const notifications = useMemo(() => {
    const enabled = settings.notifications || {};
    return NotificationService.buildNotifications({
      storedNotifications,
      medicines,
      meals,
      waterGoals,
      waterIntake,
      appointments,
      emergencies,
      caregiverId,
      receiverId,
      user,
    }).filter((item) => enabled[item.type] !== false);
  }, [appointments, caregiverId, emergencies, meals, medicines, receiverId, settings.notifications, storedNotifications, user, waterGoals, waterIntake]);

  const filteredNotifications =
    category === "all"
      ? notifications
      : notifications.filter((item) => item.type === category);
  const userReads = NotificationService.readIds(reads, user.id);
  const unread = notifications.filter((item) => !userReads.includes(item.id));
  const latest = NotificationService.latest(notifications);

  const markRead = (id) => {
    setReads((items) => NotificationService.markRead(items, user.id, id));
  };

  const markUnread = (id) => {
    setReads((items) => NotificationService.markUnread(items, user.id, id));
  };

  const markAllRead = () => {
    setReads((items) =>
      NotificationService.markAllRead(items, user.id, notifications),
    );
  };

  const deleteNotification = (notification) => {
    setStoredNotifications((items) =>
      NotificationService.deleteNotification(items, notification, user.id),
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Notification center"
        subtitle={`${unread.length} unread notification${unread.length === 1 ? "" : "s"}`}
        action={
          <SecondaryButton onClick={markAllRead} disabled={!unread.length}>
            Mark all read
          </SecondaryButton>
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Unread" value={unread.length} />
          {["medicine", "meal", "water", "appointment"].map((type) => (
            <StatCard
              key={type}
              label={type}
              value={notifications.filter((item) => item.type === type).length}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Latest notifications" subtitle="Most recent care updates.">
        <div className="grid gap-3 md:grid-cols-3">
          {latest.map((item) => (
            <div key={item.id} className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${categoryStyles[item.type] || "bg-pink-100 text-pink-700"}`}>
                {item.type}
              </span>
              <h3 className="mt-2 font-bold text-slate-800">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.message}</p>
            </div>
          ))}
          {!latest.length && <EmptyState>No notifications yet.</EmptyState>}
        </div>
      </SectionCard>

      <SectionCard title="Notification history" subtitle="Filter, read, unread, or delete notifications.">
        <div className="mb-4 flex flex-wrap gap-2">
          {["all", "medicine", "meal", "water", "appointment", "emergency"].map((type) => (
            <button
              key={type}
              onClick={() => setCategory(type)}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                category === type
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-500/20"
                  : "border border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {!filteredNotifications.length && <EmptyState>No notifications in this category.</EmptyState>}
          {filteredNotifications.map((item) => {
            const isUnread = !userReads.includes(item.id);
            return (
              <article
                key={item.id}
                className={`rounded-[1.35rem] border p-4 transition ${
                  isUnread
                    ? "border-pink-200 bg-pink-50/70"
                    : "border-pink-100 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${categoryStyles[item.type] || "bg-pink-100 text-pink-700"}`}>
                      {item.type}
                    </span>
                    <h3 className="mt-2 font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isUnread ? (
                      <SecondaryButton onClick={() => markRead(item.id)}>
                        Mark read
                      </SecondaryButton>
                    ) : (
                      <SecondaryButton onClick={() => markUnread(item.id)}>
                        Mark unread
                      </SecondaryButton>
                    )}
                    <SecondaryButton
                      onClick={() => deleteNotification(item)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
