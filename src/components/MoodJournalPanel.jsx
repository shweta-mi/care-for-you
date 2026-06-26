import { useMemo, useState } from "react";
import { SmilePlus, TrendingUp } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { createId } from "../services/storageService";
import { toDateKey } from "../utils/dateUtils";
import { formatShortDate } from "../utils/featureUtils";
import { EmptyState, Field, PrimaryButton, SectionCard, StatCard } from "./ui";

const moods = [
  { value: 5, label: "Peaceful", color: "bg-emerald-500" },
  { value: 4, label: "Okay", color: "bg-teal-500" },
  { value: 3, label: "Tender", color: "bg-amber-500" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 1, label: "Hard", color: "bg-rose-500" },
];

export default function MoodJournalPanel({ user, caregiverId, receiverId }) {
  const [entries, setEntries] = useStoredCollection(STORAGE_KEYS.moodJournal);
  const [form, setForm] = useState({ mood: 4, note: "", date: toDateKey() });
  const pairEntries = useMemo(
    () =>
      entries
        .filter((item) => item.receiverId === receiverId)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)),
    [entries, receiverId],
  );
  const latest = pairEntries[0];
  const average = pairEntries.length
    ? (pairEntries.reduce((sum, item) => sum + Number(item.mood || 0), 0) / pairEntries.length).toFixed(1)
    : "-";

  const saveMood = (event) => {
    event.preventDefault();
    if (user.role !== "receiver") return;
    setEntries((items) => [
      ...items.filter((item) => !(item.receiverId === receiverId && item.date === form.date)),
      {
        id: createId(),
        caregiverId,
        receiverId,
        mood: Number(form.mood),
        label: moods.find((mood) => mood.value === Number(form.mood))?.label || "Okay",
        note: form.note.trim(),
        date: form.date,
        createdAt: new Date().toISOString(),
      },
    ]);
    setForm({ mood: 4, note: "", date: toDateKey() });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Mood journal" subtitle={user.role === "receiver" ? "Log how today feels in a few seconds." : "View mood history and gentle trends."}>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Latest mood" value={latest?.label || "None"} />
          <StatCard label="Average" value={average} accent="text-emerald-600" />
          <StatCard label="Entries" value={pairEntries.length} accent="text-pink-700" />
        </div>

        {user.role === "receiver" && (
          <form onSubmit={saveMood} className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <p className="text-sm font-semibold text-slate-700">Today’s mood</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {moods.map((mood) => (
                  <button
                    type="button"
                    key={mood.value}
                    onClick={() => setForm({ ...form, mood: mood.value })}
                    aria-pressed={Number(form.mood) === mood.value}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      Number(form.mood) === mood.value
                        ? "border-pink-400 bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                        : "border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
              <Field
                label="Note"
                as="textarea"
                rows="3"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="Anything you want your caregiver to know?"
                className="mt-4"
              />
            </div>
            <div className="space-y-3">
              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
              <PrimaryButton type="submit" className="w-full">
                <SmilePlus size={16} />
                Save mood
              </PrimaryButton>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard title="Mood trends" subtitle="Recent entries from newest to oldest.">
        <div className="space-y-3">
          {pairEntries.slice(0, 14).map((entry) => {
            const mood = moods.find((item) => item.value === Number(entry.mood)) || moods[1];
            return (
              <article key={entry.id} className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${mood.color}`} />
                  <p className="font-semibold text-slate-900">{entry.label}</p>
                  <p className="ml-auto text-sm text-slate-500">{formatShortDate(entry.date)}</p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-pink-50">
                  <div className={`${mood.color} h-full rounded-full`} style={{ width: `${Number(entry.mood) * 20}%` }} />
                </div>
                {entry.note && <p className="mt-3 text-sm leading-6 text-slate-600">{entry.note}</p>}
              </article>
            );
          })}
          {!pairEntries.length && <EmptyState icon={TrendingUp} title="No mood entries yet">Mood history will appear here after the receiver logs a check-in.</EmptyState>}
        </div>
      </SectionCard>
    </div>
  );
}
