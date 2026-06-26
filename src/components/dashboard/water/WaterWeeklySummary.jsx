export default function WaterWeeklySummary({ summary, goal }) {
  return (
    <div className="flex h-44 items-end gap-2">
      {summary.map((day) => {
        const height = Math.max(8, Math.min(100, day.percentage));
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {day.amount}
            </span>
            <div className="flex h-28 w-full items-end rounded-xl bg-cyan-50">
              <div
                className="w-full rounded-xl bg-cyan-400 shadow-sm shadow-cyan-500/20"
                style={{ height: `${height}%` }}
                title={`${day.percentage}% of ${goal} ml`}
              />
            </div>
            <span className="text-[10px] text-slate-500">{day.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}
