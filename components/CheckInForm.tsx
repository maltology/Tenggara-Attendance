"use client";

import { useState } from "react";
import { AttendanceRecord, Staff } from "@/lib/types";
import { calculateHours, generateId } from "@/lib/storage";
import { Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface CheckInFormProps {
  staff: Staff[];
  onSubmit: (record: AttendanceRecord) => void;
}

export default function CheckInForm({ staff, onSubmit }: CheckInFormProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = format(new Date(), "HH:mm");

  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(today);
  const [clockIn, setClockIn] = useState("09:00");
  const [clockOut, setClockOut] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  const activeStaff = staff.filter((s) => s.active);
  const selectedStaff = staff.find((s) => s.id === staffId);
  const previewHours =
    clockIn && clockOut ? calculateHours(clockIn, clockOut) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !date || !clockIn || !clockOut) return;

    const record: AttendanceRecord = {
      id: generateId(),
      staffId,
      staffName: selectedStaff?.name || "",
      date,
      clockIn,
      clockOut,
      totalHours: calculateHours(clockIn, clockOut),
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    onSubmit(record);
    setSuccess(true);
    setNotes("");
    setTimeout(() => setSuccess(false), 2500);
  };

  const setNowIn = () => setClockIn(now);
  const setNowOut = () => setClockOut(now);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Rekod Check In / Check Out
            </h2>
            <p className="text-xs text-slate-500">
              Masukkan maklumat kehadiran staff
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Rekod berjaya disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Staff <span className="text-rose-500">*</span>
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">-- Pilih Staff --</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.position ? `(${s.position})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tarikh <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clock In <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockIn}
                  onChange={(e) => setClockIn(e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={setNowIn}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Sekarang
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clock Out <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockOut}
                  onChange={(e) => setClockOut(e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={setNowOut}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* Preview hours */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-sky-50 border border-sky-100">
            <span className="text-sm text-sky-700 font-medium">
              Anggaran Jumlah Jam
            </span>
            <span className="text-lg font-bold text-sky-800">
              {previewHours.toFixed(2)} jam
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nota (pilihan)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Contoh: Kerja lebih masa, cuti separuh hari..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!staffId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Simpan Rekod Kehadiran
          </button>
        </form>
      </div>
    </div>
  );
}
