import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { toDateKey } from "../utils/dateUtils";
import { EmptyState, SectionCard, StatCard } from "./ui";

const eventStyles = {
  medicine: "bg-emerald-100 text-emerald-700",
  meal: "bg-orange-100 text-orange-700",
  water: "bg-cyan-100 text-cyan-700",
  appointment: "bg-violet-100 text-violet-700",
  mood: "bg-pink-100 text-pink-700",
  achievement: "bg-amber-100 text-amber-700",
  love: "bg-rose-100 text-rose-700",
};

const monthDays = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, index) => `${monthValue}-${String(index + 1).padStart(2, "0")}`);
};

export default function CareCalendarPanel({ caregiverId, receiverId }) {
  const [month, setMonth] = useState(toDateKey().slice(0, 7));
  const [medicineHistory] = useStoredCollection(STORAGE_KEYS.medicineHistory);
  const [mealHistory] = useStoredCollection(STORAGE_KEYS.mealHistory);
  const [waterIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const [appointments] = useStoredCollection(STORAGE_KEYS.appointments);
  const [moods] = useStoredCollection(STORAGE_KEYS.moodJournal);
  const [loveMessages] = useStoredCollection(STORAGE_KEYS.loveMessages);

  const eventsByDate = useMemo(() => {
    const map = {};
    const add = (date, type, label) => {
      if (!date?.startsWith(month)) return;
      map[date] = [...(map[date] || []), { type, label }];
    };

    medicineHistory
      .filter((item) => item.caregiverId === caregiverId && item.receiverId === receiverId)
      .forEach((item) => add(item.date, "medicine", `Medicine ${item.status}`));
    mealHistory
      .filter((item) => item.caregiverId === caregiverId && item.receiverId === receiverId)
      .forEach((item) => add(item.date, "meal", item.completed ? "Meal done" : "Meal planned"));
    waterIntake
      .filter((item) => item.receiverId === receiverId)
      .forEach((item) => add(item.date, "water", `${item.amount} ml water`));
    appointments
      .filter((item) => item.caregiverId === caregiverId && item.receiverId === receiverId)
      .forEach((item) => add(item.date, "appointment", item.title || "Appointment"));
    moods
      .filter((item) => item.receiverId === receiverId)
      .forEach((item) => add(item.date, "mood", `Mood: ${item.label}`));
    loveMessages
      .filter((item) => item.caregiverId === caregiverId && item.receiverId === receiverId)
      .forEach((item) => add(item.createdAt?.slice(0, 10), "love", "Send Love"));

    Object.entries(map).forEach(([date, events]) => {
      const types = new Set(events.map((event) => event.type));
      if (["medicine", "meal", "water", "mood", "love"].every((type) => types.has(type))) {
        map[date] = [{ type: "achievement", label: "Perfect care day" }, ...events];
      }
    });
    return map;
  }, [appointments, caregiverId, loveMessages, mealHistory, medicineHistory, month, moods, receiverId, waterIntake]);

  const days = monthDays(month);
  const activeEvents = Object.values(eventsByDate).flat();

  return (
    <div className="space-y-6">
      <SectionCard title="Care calendar" subtitle="A monthly view of routines, care moments, and wins.">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-label="Care calendar month"
            className="rounded-2xl border border-pink-100 bg-white px-4 py-3 font-semibold text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Care events" value={activeEvents.length} />
            <StatCard label="Send Love" value={activeEvents.filter((item) => item.type === "love").length} accent="text-rose-600" />
            <StatCard label="Mood logs" value={activeEvents.filter((item) => item.type === "mood").length} accent="text-pink-700" />
            <StatCard label="Wins" value={activeEvents.filter((item) => item.type === "achievement").length} accent="text-amber-600" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Monthly timeline">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => (
            <article key={day} className="min-h-36 rounded-[var(--care-radius-lg)] border border-pink-100 bg-white/80 p-3 shadow-sm shadow-pink-900/5">
              <p className="text-sm font-semibold text-slate-900">{Number(day.slice(-2))}</p>
              <div className="mt-3 space-y-1.5">
                {(eventsByDate[day] || []).slice(0, 5).map((event, index) => (
                  <p key={`${event.type}-${index}`} className={`truncate rounded-full px-2.5 py-1 text-xs font-semibold ${eventStyles[event.type]}`}>
                    {event.label}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
        {!activeEvents.length && (
          <div className="mt-4">
            <EmptyState icon={CalendarDays} title="No events this month">Care activity will appear here automatically.</EmptyState>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
