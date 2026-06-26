import { EmptyState } from "../../ui";

export default function WaterHistory({ entries }) {
  return (
    <div className="space-y-2">
      {entries.map((item) => (
        <div
          key={item.id}
          className="flex justify-between rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 text-sm shadow-sm shadow-pink-900/5"
        >
          <span className="font-semibold text-slate-700">{item.amount} ml</span>
          <span className="text-slate-500">
            {new Date(item.time || item.createdAt).toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
      {entries.length === 0 && <EmptyState>No water intake recorded today.</EmptyState>}
    </div>
  );
}
