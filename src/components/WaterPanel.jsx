import WaterGoalForm from "./dashboard/water/WaterGoalForm";
import WaterHistory from "./dashboard/water/WaterHistory";
import WaterIntakeControls from "./dashboard/water/WaterIntakeControls";
import WaterWeeklySummary from "./dashboard/water/WaterWeeklySummary";
import { ProgressBar, SectionCard, StatCard } from "./ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { WaterService } from "../services/waterService";
import { toDateKey } from "../utils/dateUtils";

export default function WaterPanel({ user, caregiverId, receiverId }) {
  const [goals, setGoals] = useStoredCollection(STORAGE_KEYS.waterGoals);
  const [intake, setIntake] = useStoredCollection(STORAGE_KEYS.waterIntake);
  const today = toDateKey();
  const goal = WaterService.goalAmount(goals, caregiverId, receiverId);
  const todayTotal = WaterService.totalForDate(intake, receiverId, today);
  const remaining = Math.max(goal - todayTotal, 0);
  const percentage = goal ? Math.round((todayTotal / goal) * 100) : 0;
  const todayEntries = WaterService.dailyEntries(intake, receiverId, today)
    .slice()
    .reverse();
  const weeklySummary = WaterService.weeklySummary(intake, receiverId, goal);

  const saveGoal = (amount) => {
    setGoals((items) =>
      WaterService.saveGoal(items, caregiverId, receiverId, amount),
    );
  };

  const deleteGoal = () => {
    if (!window.confirm("Delete the daily water goal?")) return;
    setGoals((items) => WaterService.deleteGoal(items, caregiverId, receiverId));
  };

  const addWater = (amount) => {
    setIntake((items) =>
      WaterService.addIntake(items, caregiverId, receiverId, amount, today, goal),
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Daily hydration" subtitle="Small sips add up.">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Consumed" value={`${todayTotal} ml`} />
          <StatCard label="Daily goal" value={`${goal} ml`} />
          <StatCard label="Remaining" value={`${remaining} ml`} accent="text-cyan-600" />
          <StatCard
            label="Progress"
            value={`${Math.min(percentage, 100)}%`}
            accent="text-cyan-600"
          />
        </div>
        <div className="mt-5">
          <ProgressBar value={percentage} color="bg-cyan-500" />
        </div>
        {user.role === "receiver" && <WaterIntakeControls onAdd={addWater} />}
      </SectionCard>

      {user.role === "caregiver" && (
        <SectionCard
          title="Water goal"
          subtitle="Set, edit, or delete the receiver’s daily target."
        >
          <WaterGoalForm goal={goal} onSave={saveGoal} onDelete={deleteGoal} />
        </SectionCard>
      )}

      <SectionCard title="Daily water history" subtitle="Today’s intake entries.">
        <WaterHistory entries={todayEntries} />
      </SectionCard>

      <SectionCard title="Weekly summary" subtitle="Daily intake in millilitres.">
        <WaterWeeklySummary summary={weeklySummary} goal={goal} />
      </SectionCard>
    </div>
  );
}
