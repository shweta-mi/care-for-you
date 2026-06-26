import { useMemo, useState } from "react";
import { BarChart, LineChart, PieChart } from "./dashboard/reports/ReportCharts";
import { downloadTextPdf } from "../utils/pdfExport";
import { buildCareReport } from "../utils/reportUtils";
import {
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SectionCard,
  StatCard,
} from "./ui";

const periodLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function ReportsPanel({ caregiverId, receiverId }) {
  const [period, setPeriod] = useState("weekly");
  const report = useMemo(
    () => buildCareReport({ caregiverId, receiverId, period }),
    [caregiverId, period, receiverId],
  );

  const exportPdf = () => {
    downloadTextPdf(
      `care-for-shweta-${period}-report.pdf`,
      `Care For Shweta - ${periodLabels[period]} Report`,
      [
        {
          heading: "Report period",
          rows: [`${report.from} to ${report.to}`, `Generated: ${new Date(report.generatedAt).toLocaleString()}`],
        },
        {
          heading: "Medicine report",
          rows: [
            `Scheduled medicines: ${report.medicine.scheduled}`,
            `Tracked doses: ${report.medicine.tracked}`,
            `Taken: ${report.medicine.taken}`,
            `Skipped: ${report.medicine.skipped}`,
            `Missed: ${report.medicine.missed}`,
            `Taken percentage: ${report.medicine.takenPercent}%`,
            `Missed percentage: ${report.medicine.missedPercent}%`,
            `Completion: ${report.medicine.completion}%`,
          ],
        },
        {
          heading: "Meal report",
          rows: [
            `Planned meals: ${report.meals.planned}`,
            `Completed meals: ${report.meals.completed}`,
            `Completion: ${report.meals.completion}%`,
          ],
        },
        {
          heading: "Water report",
          rows: [
            `Total intake: ${report.water.total} ml`,
            `Daily average: ${report.water.average} ml`,
            `Goal completion: ${report.water.goalCompletion}%`,
          ],
        },
        {
          heading: "Health report",
          rows: [
            `Vitals readings: ${report.health.readings}`,
            `Appointments: ${report.health.appointments}`,
            `Appointment attendance: ${report.health.appointmentAttendance}%`,
            report.health.latest
              ? `Latest: BP ${report.health.latest.systolic || "-"}/${report.health.latest.diastolic || "-"}, heart ${report.health.latest.heartRate || "-"} bpm, oxygen ${report.health.latest.oxygen || "-"}%`
              : "Latest vitals: No reading recorded",
          ],
        },
      ],
    );
  };

  const printReport = () => window.print();

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `care-for-shweta-${period}-report.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Care reports"
        subtitle="Daily, weekly, and monthly summaries from your saved care records."
        action={
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={exportPdf}>Export PDF</PrimaryButton>
            <SecondaryButton onClick={printReport}>
              Print
            </SecondaryButton>
            <SecondaryButton onClick={downloadJson}>
              Download data
            </SecondaryButton>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Report period">
          {Object.entries(periodLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              aria-pressed={period === value}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                period === value
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-500/20"
                  : "border border-pink-100 bg-white text-slate-700 hover:bg-pink-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          {report.from} to {report.to}
        </p>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Medicine report">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total medicines" value={report.medicine.scheduled} />
            <StatCard label="Taken" value={report.medicine.taken} accent="text-emerald-600" />
            <StatCard label="Skipped" value={report.medicine.skipped} accent="text-amber-600" />
            <StatCard label="Missed %" value={`${report.medicine.missedPercent}%`} accent="text-red-600" />
          </div>
          <div className="mt-5 flex justify-between text-sm font-bold">
            <span>Completion</span>
            <span>{report.medicine.completion}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={report.medicine.completion} color="bg-emerald-500" />
          </div>
        </SectionCard>
        <SectionCard title="Meal report">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Planned" value={report.meals.planned} />
            <StatCard label="Completed" value={report.meals.completed} accent="text-emerald-600" />
            <StatCard label="Meal completion" value={`${report.meals.completion}%`} />
          </div>
          <div className="mt-5">
            <ProgressBar value={report.meals.completion} />
          </div>
        </SectionCard>
        <SectionCard title="Water report">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total" value={`${report.water.total} ml`} accent="text-cyan-600" />
            <StatCard label="Daily average" value={`${report.water.average} ml`} accent="text-cyan-600" />
            <StatCard label="Goal completion" value={`${report.water.goalCompletion}%`} accent="text-cyan-600" />
            <StatCard label="Daily goal" value={`${report.water.goal} ml`} />
          </div>
        </SectionCard>
        <SectionCard title="Health report">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Vitals readings" value={report.health.readings} accent="text-violet-600" />
            <StatCard label="Appointments" value={report.health.appointments} />
            <StatCard label="Attendance" value={`${report.health.appointmentAttendance}%`} />
          </div>
          {report.health.latest && (
            <p className="mt-4 text-sm text-slate-600">
              Latest BP: {report.health.latest.systolic || "—"}/
              {report.health.latest.diastolic || "—"} · Heart rate:{" "}
              {report.health.latest.heartRate || "—"} bpm · Oxygen:{" "}
              {report.health.latest.oxygen || "—"}%
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Completion analytics" subtitle="Percent completion by care area.">
          <BarChart data={report.analytics.completionBars} />
        </SectionCard>
        <SectionCard title="Medicine status" subtitle="Taken, skipped, and missed doses.">
          <PieChart data={report.analytics.medicineStatus} />
        </SectionCard>
        <SectionCard title="Water intake trend" subtitle="Daily water intake for this period.">
          <LineChart data={report.analytics.waterSeries} />
        </SectionCard>
      </div>

      <SectionCard
        title="Printable report"
        subtitle="A clean summary designed for print or PDF review."
      >
        <div className="space-y-3 rounded-[1.5rem] border border-pink-100 bg-pink-50/45 p-5 text-sm print:border-0 print:bg-white">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Care For Shweta - {periodLabels[period]} Report
          </h3>
          <p className="text-slate-600">
            {report.from} to {report.to}
          </p>
          <p>
            Medicines: {report.medicine.takenPercent}% taken,{" "}
            {report.medicine.missedPercent}% missed.
          </p>
          <p>
            Meals: {report.meals.completed} completed. Water:{" "}
            {report.water.goalCompletion}% of goal. Appointments:{" "}
            {report.health.appointmentAttendance}% attendance.
          </p>
          <p>
            Health summary:{" "}
            {report.health.latest
              ? `Latest BP ${report.health.latest.systolic || "-"}/${report.health.latest.diastolic || "-"}, HR ${report.health.latest.heartRate || "-"} bpm, BMI ${report.health.latest.bmi || "-"}`
              : "No vitals recorded in this period."}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
