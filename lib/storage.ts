import { Staff, AttendanceRecord } from "./types";
import { supabase } from "./supabase";

export async function loadStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("staff")
    .select("id,name,position,active")
    .order("name");
  if (error) throw new Error(`Gagal memuatkan staff: ${error.message}`);
  return (data ?? []) as Staff[];
}

export async function saveStaff(staff: Staff[]): Promise<void> {
  const { data: existing, error: readError } = await supabase
    .from("staff")
    .select("id");
  if (readError) throw new Error(`Gagal membaca staff: ${readError.message}`);

  const nextIds = new Set(staff.map((s) => s.id));
  const removedIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !nextIds.has(id));

  if (removedIds.length) {
    const { error } = await supabase.from("staff").delete().in("id", removedIds);
    if (error) throw new Error(`Gagal memadam staff: ${error.message}`);
  }

  if (staff.length) {
    const { error } = await supabase.from("staff").upsert(
      staff.map((s) => ({
        id: s.id,
        name: s.name,
        position: s.position ?? "",
        active: s.active,
      })),
      { onConflict: "id" }
    );
    if (error) throw new Error(`Gagal menyimpan staff: ${error.message}`);
  }
}

export async function loadAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("id,staff_id,staff_name,date,clock_in,clock_out,total_hours,notes,created_at")
    .order("date", { ascending: false });
  if (error) throw new Error(`Gagal memuatkan rekod: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    staffId: row.staff_id ?? "",
    staffName: row.staff_name,
    date: row.date,
    clockIn: row.clock_in?.slice(0, 5) ?? "",
    clockOut: row.clock_out?.slice(0, 5) ?? "",
    totalHours: Number(row.total_hours ?? 0),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function saveAttendance(records: AttendanceRecord[]): Promise<void> {
  const { data: existing, error: readError } = await supabase
    .from("attendance")
    .select("id");
  if (readError) throw new Error(`Gagal membaca rekod: ${readError.message}`);

  const nextIds = new Set(records.map((r) => r.id));
  const removedIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !nextIds.has(id));

  if (removedIds.length) {
    const { error } = await supabase.from("attendance").delete().in("id", removedIds);
    if (error) throw new Error(`Gagal memadam rekod: ${error.message}`);
  }

  if (records.length) {
    const { error } = await supabase.from("attendance").upsert(
      records.map((r) => ({
        id: r.id,
        staff_id: r.staffId || null,
        staff_name: r.staffName,
        date: r.date,
        clock_in: r.clockIn || null,
        clock_out: r.clockOut || null,
        total_hours: r.totalHours,
        notes: r.notes ?? null,
        created_at: r.createdAt,
      })),
      { onConflict: "id" }
    );
    if (error) throw new Error(`Gagal menyimpan rekod: ${error.message}`);
  }
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
  return crypto.randomUUID();
}
