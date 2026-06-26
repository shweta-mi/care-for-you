import { useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useStoredCollection } from "../hooks/useStoredCollection";
import { EmergencyService } from "../services/emergencyService";
import {
  EmptyState,
  Field,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
} from "./ui";

export default function EmergencyPanel({ user, caregiverId, receiverId }) {
  const [emergencies, setEmergencies] = useStoredCollection(
    STORAGE_KEYS.emergencies,
  );
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState(
    `${user.fullName} needs urgent assistance. Please check in immediately.`,
  );
  const pairEmergencies = EmergencyService.forCarePair(
    emergencies,
    caregiverId,
    receiverId,
  );
  const activeAlerts = pairEmergencies.filter((item) => item.status === "active");

  const sendSos = () => {
    setEmergencies((items) => [
      ...items,
      EmergencyService.createSos(user, caregiverId, receiverId, message),
    ]);
    setConfirming(false);
    setMessage(`${user.fullName} needs urgent assistance. Please check in immediately.`);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Emergency SOS sent", {
        body: "Your caregiver alert has been recorded.",
      });
    }
  };

  const resolve = (id) => {
    setEmergencies((items) => EmergencyService.resolve(items, id));
  };

  return (
    <div className="space-y-6">
      {user.role === "receiver" && (
        <SectionCard
          title="Emergency SOS"
          subtitle="Use this only when you need your caregiver’s immediate attention."
          className="border-red-200"
        >
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="grid min-h-44 w-full place-items-center rounded-[1.75rem] bg-red-600 text-3xl font-semibold tracking-tight text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
              aria-label="Start emergency SOS"
            >
              SOS
            </button>
          ) : (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-center">
              <h3 className="text-xl font-semibold tracking-tight text-red-700">
                Send emergency alert?
              </h3>
              <p className="mt-2 text-sm text-red-600">
                This creates a high-priority alert in your caregiver’s dashboard.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <div className="w-full max-w-xl text-left">
                  <Field
                    label="Emergency message"
                    as="textarea"
                    rows="3"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-center gap-3">
                <PrimaryButton
                  onClick={sendSos}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, send SOS
                </PrimaryButton>
                <SecondaryButton onClick={() => setConfirming(false)}>
                  Cancel
                </SecondaryButton>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            This in-app SOS does not contact local emergency services. Call your
            local emergency number for immediate medical help.
          </p>
        </SectionCard>
      )}

      {user.role === "caregiver" && (
        <SectionCard
          title="Emergency alert panel"
          subtitle={`${activeAlerts.length} active alert${activeAlerts.length === 1 ? "" : "s"}`}
          className={activeAlerts.length ? "border-red-200 bg-red-50/40" : ""}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {activeAlerts.slice(0, 2).map((alert) => (
              <article key={alert.id} className="rounded-[1.35rem] border border-red-200 bg-white p-4 shadow-sm shadow-red-900/5">
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                  Active SOS
                </span>
                <p className="mt-3 font-semibold text-slate-800">{alert.message}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
                <PrimaryButton
                  onClick={() => resolve(alert.id)}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-600"
                >
                  Mark resolved
                </PrimaryButton>
              </article>
            ))}
            {!activeAlerts.length && <EmptyState>No active emergency alerts.</EmptyState>}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title={user.role === "caregiver" ? "Latest emergency alerts" : "Emergency history"}
        subtitle="A permanent record of SOS activity on this device."
      >
        <div className="space-y-3">
          {!pairEmergencies.length && (
            <EmptyState>No emergency alerts recorded.</EmptyState>
          )}
          {pairEmergencies.map((emergency) => (
            <article
              key={emergency.id}
                className={`rounded-[1.35rem] border p-4 ${
                  emergency.status === "active"
                    ? "border-red-200 bg-red-50"
                  : "border-pink-100 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                      emergency.status === "active"
                        ? "bg-red-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {emergency.status}
                  </span>
                  <p className="mt-3 font-semibold text-slate-800">
                    {emergency.message}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(emergency.timestamp).toLocaleString()}
                  </p>
                </div>
                {user.role === "caregiver" && emergency.status === "active" && (
                  <PrimaryButton
                    onClick={() => resolve(emergency.id)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Mark resolved
                  </PrimaryButton>
                )}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
