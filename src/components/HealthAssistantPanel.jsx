import { useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { askHealthAssistant } from "../services/aiAssistantService";
import { aiService } from "../services/aiService";
import { createId } from "../services/storageService";
import { toDateKey } from "../utils/dateUtils";
import { EmptyState, Field, PrimaryButton, SectionCard } from "./ui";

export default function HealthAssistantPanel({ user, caregiverId, receiverId }) {
  const [allChats, setAllChats] = useStoredCollection(STORAGE_KEYS.assistantChats);
  const [notes, setNotes] = useStoredCollection(STORAGE_KEYS.symptomNotes);
  const [medicines] = useStoredCollection(STORAGE_KEYS.medicines);
  const [medicineHistory] = useStoredCollection(STORAGE_KEYS.medicineHistory);
  const [meals] = useStoredCollection(STORAGE_KEYS.meals);
  const [mealHistory] = useStoredCollection(STORAGE_KEYS.mealHistory);
  const [waterGoals] = useStoredCollection(STORAGE_KEYS.waterGoals);
  const [waterIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const [vitals] = useStoredCollection(STORAGE_KEYS.vitals);
  const [appointments] = useStoredCollection(STORAGE_KEYS.appointments);
  const [moods] = useStoredCollection(STORAGE_KEYS.moodJournal);
  const [loveMessages] = useStoredCollection(STORAGE_KEYS.loveMessages);
  const [message, setMessage] = useState("");
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const chats = allChats.filter((item) => item.userId === user.id);
  const today = toDateKey();
  const pair = (item) =>
    item.caregiverId === caregiverId && item.receiverId === receiverId;
  const todaysMedicines = medicines.filter(pair);
  const todaysMedicineHistory = medicineHistory.filter(
    (item) => pair(item) && item.date === today,
  );
  const todaysMeals = meals.filter(pair);
  const todaysMealHistory = mealHistory.filter(
    (item) => pair(item) && item.date === today,
  );
  const waterGoal =
    waterGoals.find(pair)?.goal || waterGoals.find(pair)?.amount || 2000;
  const waterTotal = waterIntake
    .filter((item) => item.receiverId === receiverId && item.date === today)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const latestVitals = vitals.filter(pair).sort((a, b) => b.date.localeCompare(a.date))[0];
  const upcomingAppointments = appointments.filter(
    (item) => pair(item) && !item.completed && item.date >= today,
  );
  const latestMood = moods
    .filter((item) => item.receiverId === receiverId)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0];
  const todaysLoveCount = loveMessages.filter(
    (item) =>
      item.caregiverId === caregiverId &&
      item.receiverId === receiverId &&
      item.createdAt?.slice(0, 10) === today,
  ).length;
  const dailySummary = aiService.getDailySummary({
    medicines: todaysMedicines,
    medicineHistory: todaysMedicineHistory,
    meals: todaysMeals,
    mealHistory: todaysMealHistory,
    waterTotal,
    waterGoal,
    latestVitals,
    appointments: upcomingAppointments,
  });
  const suggestions = aiService.getSuggestedQuestions();
  const tips = aiService.getHealthTips();
  const personalizedSuggestions = aiService.getPersonalizedCareSuggestions({
    latestMood,
    waterTotal,
    waterGoal,
    upcomingAppointments,
    pendingMedicines: Math.max(todaysMedicines.length - todaysMedicineHistory.length, 0),
    loveCount: todaysLoveCount,
  });
  const encouragements = aiService.getEncouragementSuggestions(latestMood);

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;
    setLoading(true);
    const userMessage = {
      id: createId(),
      userId: user.id,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setAllChats((items) => [...items, userMessage]);
    setMessage("");
    const response = await askHealthAssistant(text);
    setAllChats((items) => [
      ...items,
      {
        id: createId(),
        userId: user.id,
        role: "assistant",
        text: response.text,
        source: response.source,
        timestamp: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  };

  const saveSymptom = (event) => {
    event.preventDefault();
    if (!symptom.trim()) return;
    setNotes((items) => [
      ...items,
      {
        id: createId(),
        authorId: user.id,
        receiverId,
        note: symptom.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setSymptom("");
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="AI care assistant"
        subtitle="Gentle organization support for routines, questions, and daily reflection."
      >
        <div className="rounded-[1.25rem] border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This assistant does not diagnose conditions or replace medical care.
          For severe or urgent symptoms, contact a clinician or emergency service.
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.35rem] border border-pink-100 bg-pink-50/70 p-4">
            <h3 className="font-bold text-slate-800">Daily care summary</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {dailySummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5">
            <h3 className="font-bold text-slate-800">Care tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.35rem] border border-pink-100 bg-white/85 p-4 shadow-sm shadow-pink-900/5">
            <h3 className="font-bold text-slate-800">Personalized suggestions</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {personalizedSuggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.35rem] border border-pink-100 bg-pink-50/70 p-4">
            <h3 className="font-bold text-slate-800">Encouragement ideas</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {encouragements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="rounded-full border border-pink-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-pink-900/5 transition hover:bg-pink-50 hover:text-pink-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div
          className="scrollbar-soft mt-5 max-h-96 space-y-3 overflow-y-auto rounded-[1.5rem] border border-pink-100 bg-white/70 p-4 shadow-inner shadow-pink-900/5"
          aria-live="polite"
        >
          {!chats.length && (
            <p className="text-center text-sm text-slate-500">
              Ask about routines, reminders, or general wellness tips.
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                chat.role === "user"
                  ? "ml-auto bg-pink-600 text-white shadow-pink-500/15"
                  : "bg-pink-50 text-slate-700 shadow-pink-900/5"
              }`}
            >
              {chat.text}
            </div>
          ))}
          {loading && <p className="text-sm text-slate-400">Thinking…</p>}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength="500"
            aria-label="Ask the AI care assistant"
            placeholder="Ask a general care question..."
            className="min-w-0 flex-1 rounded-2xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
          />
          <PrimaryButton type="submit" disabled={loading}>
            Send
          </PrimaryButton>
        </form>
      </SectionCard>

      <SectionCard title="Care notes" subtitle="Save observations to discuss with a clinician.">
        <form onSubmit={saveSymptom}>
          <Field
            label="New note"
            as="textarea"
            rows="3"
            maxLength="500"
            value={symptom}
            onChange={(event) => setSymptom(event.target.value)}
            placeholder="Describe when it started, what it feels like, and anything that changed."
          />
          <PrimaryButton type="submit" className="mt-3">
            Save symptom note
          </PrimaryButton>
        </form>
        <div className="mt-5 space-y-2">
          {notes
            .filter((item) => item.receiverId === receiverId)
            .slice(-5)
            .reverse()
            .map((note) => (
              <div key={note.id} className="rounded-2xl border border-pink-100 bg-pink-50/50 p-3 text-sm">
                <p className="text-slate-700">{note.note}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          {!notes.some((item) => item.receiverId === receiverId) && (
            <EmptyState>No symptom notes yet.</EmptyState>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
