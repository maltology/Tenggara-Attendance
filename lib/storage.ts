import { Staff, AttendanceRecord } from "./types";

const STAFF_KEY = "tenggara_staff";
const ATTENDANCE_KEY = "tenggara_attendance";

export function loadStaff(): Staff[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STAFF_KEY);
    return data ? JSON.parse(data) : getDefaultStaff();
  } catch {
    return getDefaultStaff();
  }
}

export function saveStaff(staff: Staff[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

export function loadAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : getDefaultAttendance();
  } catch {
    return getDefaultAttendance();
  }
}

export function saveAttendance(records: AttendanceRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

function getDefaultStaff(): Staff[] {
  return [
    { id: "1", name: "Ahmad bin Ismail", position: "Coach", active: true },
    { id: "2", name: "Siti Nurhaliza", position: "Admin", active: true },
    { id: "3", name: "Muhammad Hafiz", position: "Trainer", active: true },
    { id: "4", name: "Nur Aisyah", position: "Receptionist", active: true },
    { id: "5", name: "Rajesh Kumar", position: "Facilities", active: true },
  ];
}

function getDefaultAttendance(): AttendanceRecord[] {
  const today = new Date();
  const records: AttendanceRecord[] = [];
  const staff = getDefaultStaff();

  // Generate sample data for the last 14 days
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    // Skip weekends for some variety
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    staff.forEach((s, idx) => {
      // Random attendance pattern
      if (Math.random() > 0.15) {
        const clockInHour = 8 + Math.floor(Math.random() * 2);
        const clockInMin = Math.floor(Math.random() * 30);
        const workHours = 7 + Math.random() * 3;
        const clockOutHour = clockInHour + Math.floor(workHours);
        const clockOutMin = Math.floor((workHours % 1) * 60);

        const clockIn = `${String(clockInHour).padStart(2, "0")}:${String(clockInMin).padStart(2, "0")}`;
        const clockOut = `${String(Math.min(clockOutHour, 19)).padStart(2, "0")}:${String(clockOutMin).padStart(2, "0")}`;
        const totalHours = calculateHours(clockIn, clockOut);

        records.push({
          id: `${dateStr}-${s.id}-${idx}`,
          staffId: s.id,
          staffName: s.name,
          date: dateStr,
          clockIn,
          clockOut,
          totalHours,
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  return records.sort((a, b) => b.date.localeCompare(a.date) || a.staffName.localeCompare(b.staffName));
}

export function calculateHours(clockIn: string, clockOut: string): number {
  const [inH, inM] = clockIn.split(":").map(Number);
  const [outH, outM] = clockOut.split(":").map(Number);
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;
  const diff = outMinutes - inMinutes;
  return Math.max(0, Math.round((diff / 60) * 100) / 100);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
