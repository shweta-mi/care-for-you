import { formatDate } from "../../../utils/dateUtils";
import { EmptyState } from "../../ui";

export default function VitalsHistoryTable({ records }) {
  if (!records.length) return <EmptyState>No vitals recorded yet.</EmptyState>;

  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-pink-100">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            {["Date", "Weight", "BP", "Heart", "Temp", "Sugar", "Oxygen", "BMI"].map(
              (heading) => (
                <th key={heading} className="border-b border-pink-100 bg-pink-50/70 p-3">
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id} className="border-b border-pink-50 bg-white/70 hover:bg-pink-50/45">
              <td className="p-3 font-semibold">{formatDate(item.date)}</td>
              <td className="p-3">{item.weight || "—"}</td>
              <td className="p-3">
                {item.systolic ? `${item.systolic}/${item.diastolic || "—"}` : "—"}
              </td>
              <td className="p-3">{item.heartRate || "—"}</td>
              <td className="p-3">{item.temperature || "—"}</td>
              <td className="p-3">{item.bloodSugar || "—"}</td>
              <td className="p-3">{item.oxygen || "—"}</td>
              <td className="p-3">{item.bmi || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
