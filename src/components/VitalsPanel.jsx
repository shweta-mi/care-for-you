import { useMemo, useState } from "react";
import VitalsForm from "./dashboard/vitals/VitalsForm";
import VitalsHistoryTable from "./dashboard/vitals/VitalsHistoryTable";
import { EmptyState, SectionCard, StatCard } from "./ui";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import {
  emptyVitalsForm,
  VitalsService,
} from "../services/vitalsService";

export default function VitalsPanel({ user, caregiverId, receiverId }) {
  const [vitals, setVitals] = useStoredCollection(STORAGE_KEYS.vitals);
  const [form, setForm] = useState(emptyVitalsForm);
  const pairVitals = useMemo(
    () => VitalsService.forCarePair(vitals, caregiverId, receiverId),
    [caregiverId, receiverId, vitals],
  );
  const latest = pairVitals[0];
  const dailyHistory = pairVitals.slice(0, 7);
  const weeklyHistory = VitalsService.entriesSince(pairVitals, 7);
  const monthlyHistory = VitalsService.monthly(pairVitals);
  const graphEntries = weeklyHistory.slice().reverse();
  const maxHeartRate = Math.max(
    120,
    ...graphEntries.map((item) => Number(item.heartRate) || 0),
  );

  const addVitals = (event) => {
    event.preventDefault();
    if (!Object.values(form).some(Boolean)) return;
    setVitals((items) =>
      VitalsService.addRecord(items, form, caregiverId, receiverId),
    );
    setForm(emptyVitalsForm);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Latest health vitals" subtitle="Most recent recorded values.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Weight" value={latest?.weight ? `${latest.weight} kg` : "—"} />
          <StatCard
            label="Blood pressure"
            value={
              latest?.systolic
                ? `${latest.systolic}/${latest.diastolic || "—"}`
                : "—"
            }
          />
          <StatCard
            label="Heart rate"
            value={latest?.heartRate ? `${latest.heartRate} bpm` : "—"}
          />
          <StatCard label="BMI" value={latest?.bmi || "—"} accent="text-violet-600" />
          <StatCard
            label="Sugar"
            value={latest?.bloodSugar ? `${latest.bloodSugar} mg/dL` : "—"}
          />
          <StatCard
            label="Oxygen"
            value={latest?.oxygen ? `${latest.oxygen}%` : "—"}
            accent="text-cyan-600"
          />
          <StatCard
            label="Temperature"
            value={latest?.temperature ? `${latest.temperature}°F` : "—"}
          />
          <StatCard label="Monthly records" value={monthlyHistory.length} />
        </div>
      </SectionCard>

      {user.role === "caregiver" && (
        <SectionCard
          title="Record vitals"
          subtitle="Add the receiver’s health reading for today."
        >
          <VitalsForm form={form} onChange={setForm} onSubmit={addVitals} />
        </SectionCard>
      )}

      <SectionCard title="Weekly heart-rate trend" subtitle="Last seven days of readings.">
        {graphEntries.length ? (
          <div className="flex h-48 items-end gap-3">
            {graphEntries.map((item) => {
              const value = Number(item.heartRate) || 0;
              return (
                <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-bold text-violet-600">
                    {value || "—"}
                  </span>
                  <div className="flex h-32 w-full items-end rounded-xl bg-pink-50">
                    <div
                      className="w-full rounded-xl bg-pink-400 shadow-sm shadow-pink-500/20"
                      style={{
                        height: `${value ? Math.max(8, (value / maxHeartRate) * 100) : 4}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState>Add a heart-rate reading to start the trend.</EmptyState>
        )}
      </SectionCard>

      <SectionCard
        title="Vitals history"
        subtitle={`Daily: ${dailyHistory.length} · Weekly: ${weeklyHistory.length} · Monthly: ${monthlyHistory.length}`}
      >
        <VitalsHistoryTable records={pairVitals} />
      </SectionCard>
    </div>
  );
}
