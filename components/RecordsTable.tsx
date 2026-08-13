"use client";

import { useState, useMemo } from "react";
import { AttendanceRecord, Staff } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ms } from "date-fns/locale";
import { Search, Trash2, Filter, RotateCcw } from "lucide-react";

interface RecordsTableProps {
  records: AttendanceRecord[];
  staff: Staff[];
  onDelete: (id: string) => void;
  onReset: () => void;
}

export default function RecordsTable({
  records,
  staff,
  onDelete,
  onReset,
}: RecordsTableProps) {
  const [search, setSearch] = useState("");
  const [filterStaff, setFilterStaff] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const months = useMemo(() => {
    const set = new Set(records.map((r) => r.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterStaff !== "all" && r.staffId !== filterStaff) return false;
      if (filterMonth !== "all" && !r.date.startsWith(filterMonth)) return false;
      if (
        search &&
        !r.staffName.toLowerCase().includes(search.toLowerCase()) &&
        !r.date.includes(search)
      )
        return false;
      return true;
    });
  }, [records, search, filterStaff, filterMonth]);

  const totalHours = filtered.reduce((s, r) => s + r.totalHours, 0);

  return (
    <div className="space-y-4">
      <div className="records-panel rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama staff atau tarikh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="all">Semua Staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="all">Semua Bulan</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {format(parseISO(m + "-01"), "MMMM yyyy", { locale: ms })}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <span>Memaparkan <strong>{filtered.length}</strong> rekod</span>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span>Jumlah jam: <strong className="text-sky-700">{totalHours.toFixed(1)} j</strong></span>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
              title="Reset semua rekod kehadiran"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>
          </div>
        </div>
      </div>

      <div className="records-table-panel rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="records-table-head">
                <th className="text-left px-5 py-3 font-medium">Bil.</th>
                <th className="text-left px-5 py-3 font-medium">Nama Staff</th>
                <th className="text-left px-5 py-3 font-medium">Tarikh</th>
                <th className="text-left px-5 py-3 font-medium">Clock In</th>
                <th className="text-left px-5 py-3 font-medium">Clock Out</th>
                <th className="text-right px-5 py-3 font-medium">Jumlah Jam</th>
                <th className="text-center px-5 py-3 font-medium">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">Tiada rekod dijumpai</td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{r.staffName}</td>
                    <td className="px-5 py-3 text-slate-600">{format(parseISO(r.date), "dd MMM yyyy", { locale: ms })}</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-xs">{r.clockIn}</span></td>
                    <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono text-xs">{r.clockOut}</span></td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">{r.totalHours.toFixed(2)} j</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => { if (confirm("Padam rekod ini?")) onDelete(r.id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
