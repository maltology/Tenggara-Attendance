"use client";

import { useState } from "react";
import { Staff } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { UserPlus, Trash2, UserCheck, UserX } from "lucide-react";

interface StaffManagerProps {
  staff: Staff[];
  onChange: (staff: Staff[]) => void;
}

export default function StaffManager({ staff, onChange }: StaffManagerProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: Staff = {
      id: generateId(),
      name: name.trim(),
      position: position.trim() || undefined,
      active: true,
    };

    onChange([...staff, newStaff]);
    setName("");
    setPosition("");
  };

  const toggleActive = (id: string) => {
    onChange(
      staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const removeStaff = (id: string) => {
    if (confirm("Padam staff ini? Rekod kehadiran sedia ada tidak akan dipadam.")) {
      onChange(staff.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Tambah Staff Baru
            </h2>
            <p className="text-xs text-slate-500">
              Daftarkan staff untuk dipantau kehadiran
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama penuh staff *"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Jawatan (pilihan)"
            className="sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            Tambah
          </button>
        </form>
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Senarai Staff ({staff.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {staff.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">
              Tiada staff didaftarkan lagi
            </div>
          ) : (
            staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      s.active
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        s.active ? "text-slate-800" : "text-slate-400 line-through"
                      }`}
                    >
                      {s.name}
                    </p>
                    {s.position && (
                      <p className="text-xs text-slate-500">{s.position}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(s.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      s.active
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                    title={s.active ? "Nyahaktifkan" : "Aktifkan"}
                  >
                    {s.active ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeStaff(s.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Padam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
