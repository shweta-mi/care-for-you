import { Award, Droplets, Heart, Medal, Pill, Sparkles, Utensils } from "lucide-react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { daysAgo, uniqueDateCount } from "../utils/featureUtils";
import { ProgressBar, SectionCard } from "./ui";

const cardMeta = {
  hero: { title: "Care Hero", icon: Award, color: "bg-pink-500" },
  medicine: { title: "Medicine Consistency", icon: Pill, color: "bg-emerald-500" },
  water: { title: "Water Goal", icon: Droplets, color: "bg-cyan-500" },
  meals: { title: "Meal Consistency", icon: Utensils, color: "bg-orange-500" },
  love: { title: "Send Love Streak", icon: Heart, color: "bg-rose-500" },
  week: { title: "Perfect Week", icon: Medal, color: "bg-amber-500" },
};

export default function AchievementsPanel({ caregiverId, receiverId }) {
  const [medicineHistory] = useStoredCollection(STORAGE_KEYS.medicineHistory);
  const [mealHistory] = useStoredCollection(STORAGE_KEYS.mealHistory);
  const [waterIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const [loveMessages] = useStoredCollection(STORAGE_KEYS.loveMessages);
  const [moods] = useStoredCollection(STORAGE_KEYS.moodJournal);

  const medicineTaken = medicineHistory.filter(
    (item) => item.caregiverId === caregiverId && item.receiverId === receiverId && item.status === "taken",
  );
  const mealsDone = mealHistory.filter(
    (item) => item.caregiverId === caregiverId && item.receiverId === receiverId && item.completed,
  );
  const waterDays = uniqueDateCount(waterIntake.filter((item) => item.receiverId === receiverId));
  const loveDays = new Set(
    loveMessages
      .filter((item) => item.caregiverId === caregiverId && item.receiverId === receiverId)
      .map((item) => item.createdAt?.slice(0, 10))
      .filter(Boolean),
  ).size;
  const recentDates = Array.from({ length: 7 }, (_, index) => daysAgo(index));
  const perfectDays = recentDates.filter((date) => {
    const hasMedicine = medicineTaken.some((item) => item.date === date);
    const hasMeal = mealsDone.some((item) => item.date === date);
    const hasWater = waterIntake.some((item) => item.receiverId === receiverId && item.date === date);
    const hasMood = moods.some((item) => item.receiverId === receiverId && item.date === date);
    return hasMedicine && hasMeal && hasWater && hasMood;
  }).length;

  const achievements = [
    { key: "hero", current: medicineTaken.length + mealsDone.length + waterDays, target: 30, helper: "Care actions completed" },
    { key: "medicine", current: uniqueDateCount(medicineTaken), target: 7, helper: "Days with medicine taken" },
    { key: "water", current: waterDays, target: 7, helper: "Days with hydration logged" },
    { key: "meals", current: uniqueDateCount(mealsDone), target: 7, helper: "Days with meals completed" },
    { key: "love", current: loveDays, target: 5, helper: "Days with Send Love moments" },
    { key: "week", current: perfectDays, target: 7, helper: "Complete routine days this week" },
  ];

  return (
    <SectionCard title="Achievements & streaks" subtitle="Small wins, made visible with care.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => {
          const meta = cardMeta[achievement.key];
          const Icon = meta.icon;
          const progress = Math.round((achievement.current / achievement.target) * 100);
          return (
            <article key={achievement.key} className="rounded-[var(--care-radius-lg)] border border-pink-100 bg-white/85 p-5 shadow-sm shadow-pink-900/5">
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${meta.color}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                {progress >= 100 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Sparkles size={13} />
                    Earned
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{meta.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{achievement.helper}</p>
              <div className="mt-5">
                <ProgressBar value={progress} color={meta.color} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                {Math.min(achievement.current, achievement.target)} / {achievement.target}
              </p>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
