import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  format,
} from "date-fns";
import { AttendanceRecord, Staff, SummaryStats } from "./types";

export function getDailyHours(
  records: AttendanceRecord[],
  staffId: string,
  date: string
): number {
  return records
    .filter((r) => r.staffId === staffId && r.date === date)
    .reduce((sum, r) => sum + r.totalHours, 0);
}

export function getWeeklyHours(
  records: AttendanceRecord[],
  staffId: string,
  referenceDate: Date = new Date()
): number {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return records
    .filter((r) => {
      if (r.staffId !== staffId) return false;
      const d = parseISO(r.date);
      return isWithinInterval(d, { start, end });
    })
    .reduce((sum, r) => sum + r.totalHours, 0);
}

export function getMonthlyHours(
  records: AttendanceRecord[],
  staffId: string,
  referenceDate: Date = new Date()
): number {
  const start = startOfMonth(referenceDate);
  const end = endOfMonth(referenceDate);

  return records
    .filter((r) => {
      if (r.staffId !== staffId) return false;
      const d = parseISO(r.date);
      return isWithinInterval(d, { start, end });
    })
    .reduce((sum, r) => sum + r.totalHours, 0);
}

export function getSummaryStats(
  records: AttendanceRecord[],
  staffList: Staff[],
  referenceDate: Date = new Date()
): SummaryStats[] {
  const today = format(referenceDate, "yyyy-MM-dd");

  return staffList
    .filter((s) => s.active)
    .map((s) => ({
      staffId: s.id,
      staffName: s.name,
      dailyHours: getDailyHours(records, s.id, today),
      weeklyHours: getWeeklyHours(records, s.id, referenceDate),
      monthlyHours: getMonthlyHours(records, s.id, referenceDate),
      totalRecords: records.filter((r) => r.staffId === s.id).length,
    }));
}

export function getHoursByStaffForChart(
  records: AttendanceRecord[],
  staffList: Staff[],
  period: "week" | "month",
  referenceDate: Date = new Date()
) {
  const start =
    period === "week"
      ? startOfWeek(referenceDate, { weekStartsOn: 1 })
      : startOfMonth(referenceDate);
  const end =
    period === "week"
      ? endOfWeek(referenceDate, { weekStartsOn: 1 })
      : endOfMonth(referenceDate);

  return staffList
    .filter((s) => s.active)
    .map((s) => {
      const hours = records
        .filter((r) => {
          if (r.staffId !== s.id) return false;
          const d = parseISO(r.date);
          return isWithinInterval(d, { start, end });
        })
        .reduce((sum, r) => sum + r.totalHours, 0);

      return {
        name: s.name.split(" ")[0], // First name for chart
        fullName: s.name,
        hours: Math.round(hours * 10) / 10,
      };
    })
    .sort((a, b) => b.hours - a.hours);
}

export function getDailyTrend(
  records: AttendanceRecord[],
  days: number = 14,
  referenceDate: Date = new Date()
) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dayLabel = format(d, "dd/MM");
    const total = records
      .filter((r) => r.date === dateStr)
      .reduce((sum, r) => sum + r.totalHours, 0);
    result.push({
      date: dayLabel,
      hours: Math.round(total * 10) / 10,
    });
  }
  return result;
}
