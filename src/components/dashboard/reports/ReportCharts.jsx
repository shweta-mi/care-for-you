import { motion } from "framer-motion";

function BarChart({ data, color = "bg-pink-500" }) {
  const max = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{item.value}</span>
          <div className="flex h-28 w-full items-end rounded-xl bg-pink-50">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`w-full rounded-lg ${color}`}
            />
          </div>
          <span className="text-[10px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let offset = 25;
  const stops = data.map((item) => {
    const share = total ? (item.value / total) * 100 : 0;
    const segment = `${item.color} ${offset}% ${offset + share}%`;
    offset += share;
    return segment;
  });
  const background = total
    ? `conic-gradient(${stops.join(", ")})`
    : "conic-gradient(#f1f5f9 0% 100%)";

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div
        className="h-32 w-32 rounded-full border border-pink-100 shadow-inner shadow-pink-900/10"
        style={{ background }}
        aria-label="Pie chart"
      />
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-slate-700">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }) {
  const max = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (Number(item.value || 0) / max) * 90;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 100 110" className="h-44 w-full overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="#EC4899"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((item, index) => {
          const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
          const y = 100 - (Number(item.value || 0) / max) * 90;
          return <circle key={item.label} cx={x} cy={y} r="2.8" fill="#EC4899" />;
        })}
      </svg>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 sm:grid-cols-6">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export { BarChart, LineChart, PieChart };
