"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import RecordsTable from "@/components/RecordsTable";
import CheckInForm from "@/components/CheckInForm";
import StaffManager from "@/components/StaffManager";
import { Staff, AttendanceRecord } from "@/lib/types";
import { loadStaff, saveStaff, loadAttendance, saveAttendance } from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [staffData, attendanceData] = await Promise.all([loadStaff(), loadAttendance()]);
        if (cancelled) return;
        setStaff(staffData);
        setRecords(attendanceData);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuatkan data.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    loadData();
    setDarkMode(localStorage.getItem("tenggara-theme") === "dark");
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tenggara-theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark-theme", darkMode);
  }, [darkMode, loaded]);

  const updateStaff = async (next: Staff[]) => {
    try {
      setError("");
      await saveStaff(next);
      setStaff(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan staff.");
    }
  };

  const updateRecords = async (next: AttendanceRecord[]) => {
    try {
      setError("");
      await saveAttendance(next);
      setRecords(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rekod.");
    }
  };

  const handleAddRecord = async (record: AttendanceRecord) => {
    const next = [record, ...records].sort(
      (a, b) => b.date.localeCompare(a.date) || a.staffName.localeCompare(b.staffName)
    );
    await updateRecords(next);
  };

  const handleDeleteRecord = async (id: string) => {
    await updateRecords(records.filter((r) => r.id !== id));
  };

  const handleResetAttendance = async () => {
    if (records.length === 0) {
      alert("Tiada rekod kehadiran untuk direset.");
      return;
    }
    const confirmed = confirm(
      `AMARAN: Anda akan memadam SEMUA ${records.length} rekod kehadiran.\n\nData staff tidak akan dipadam. Tindakan ini tidak boleh dibuat asal. Teruskan?`
    );
    if (confirmed) await updateRecords([]);
  };

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-500 text-sm">Memuatkan...</div></div>;
  }

  return (
    <div className="min-h-screen app-shell">
      <Header activeTab={activeTab} onTabChange={setActiveTab} darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {activeTab === "dashboard" && <Dashboard records={records} staff={staff} />}
        {activeTab === "records" && <RecordsTable records={records} staff={staff} onDelete={handleDeleteRecord} onReset={handleResetAttendance} />}
        {activeTab === "checkin" && <CheckInForm staff={staff} onSubmit={handleAddRecord} />}
        {activeTab === "staff" && <StaffManager staff={staff} onChange={updateStaff} />}
      </main>
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400">Tenggara Sports &copy; {new Date().getFullYear()} — Sistem Kehadiran Staff</footer>
    </div>
  );
}
