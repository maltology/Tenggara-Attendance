"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { AttendanceRecord, Staff } from "@/lib/types";
import {
  getSummaryStats,
  getHoursByStaffForChart,
  getDailyTrend,
} from "@/lib/calculations";
import { format } from "date-fns";
import { ms } from "date-fns/locale";
import { Clock, Calendar, TrendingUp, Users } from "lucide-react";

interface DashboardProps {
  records: AttendanceRecord[];
  staff: Staff[];
  referenceDate?: Date;
}

export default function Dashboard({
  records,
  staff,
  referenceDate = new Date(),
}: DashboardProps) {
  const stats = getSummaryStats(records, staff, referenceDate);
  const chartData = getHoursByStaffForChart(records, staff, "month", referenceDate);
  const trendData = getDailyTrend(records, 14, referenceDate);

  const totalMonthlyHours = stats.reduce((s, x) => s + x.monthlyHours, 0);
  const totalWeeklyHours = stats.reduce((s, x) => s + x.weeklyHours, 0);
  const activeStaff = staff.filter((s) => s.active).length;
  const todayRecords = records.filter(
    (r) => r.date === format(referenceDate, "yyyy-MM-dd")
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Jumlah Jam Bulan Ini"
          value={`${totalMonthlyHours.toFixed(1)} j`}
          icon={<Clock className="w-5 h-5" />}
          color="sky"
        />
        <SummaryCard
          title="Jumlah Jam Minggu Ini"
          value={`${totalWeeklyHours.toFixed(1)} j`}
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
        />
        <SummaryCard
          title="Staff Aktif"
          value={activeStaff.toString()}
          icon={<Users className="w-5 h-5" />}
          color="violet"
        />
        <SummaryCard
          title="Kehadiran Hari Ini"
          value={todayRecords.toString()}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Jumlah Jam Mengikut Staff (Bulan Ini)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number) => [`${value} jam`, "Jumlah"]}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Trend Kehadiran (14 Hari Terakhir)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number) => [`${value} jam`, "Jumlah"]}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ fill: "#0ea5e9", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Ringkasan Kehadiran Setiap Staff
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {format(referenceDate, "MMMM yyyy", { locale: ms })}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-5 py-3 font-medium">Nama Staff</th>
                <th className="text-right px-5 py-3 font-medium">Hari Ini</th>
                <th className="text-right px-5 py-3 font-medium">Minggu Ini</th>
                <th className="text-right px-5 py-3 font-medium">Bulan Ini</th>
                <th className="text-right px-5 py-3 font-medium">Jumlah Rekod</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {s.staffName}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {s.dailyHours > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium">
                        {s.dailyHours.toFixed(1)} j
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {s.weeklyHours.toFixed(1)} j
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800">
                    {s.monthlyHours.toFixed(1)} j
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500">
                    {s.totalRecords}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "sky" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
