"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import RecordsTable from "@/components/RecordsTable";
import CheckInForm from "@/components/CheckInForm";
import StaffManager from "@/components/StaffManager";
import { Staff, AttendanceRecord } from "@/lib/types";
import {
  loadStaff,
  saveStaff,
  loadAttendance,
  saveAttendance,
} from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStaff(loadStaff());
    setRecords(loadAttendance());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveStaff(staff);
  }, [staff, loaded]);

  useEffect(() => {
    if (loaded) saveAttendance(records);
  }, [records, loaded]);

  const handleAddRecord = (record: AttendanceRecord) => {
    setRecords((prev) =>
      [record, ...prev].sort(
        (a, b) =>
          b.date.localeCompare(a.date) || a.staffName.localeCompare(b.staffName)
      )
    );
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-sm">Memuatkan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <Dashboard records={records} staff={staff} />
        )}
        {activeTab === "records" && (
          <RecordsTable
            records={records}
            staff={staff}
            onDelete={handleDeleteRecord}
          />
        )}
        {activeTab === "checkin" && (
          <CheckInForm staff={staff} onSubmit={handleAddRecord} />
        )}
        {activeTab === "staff" && (
          <StaffManager staff={staff} onChange={setStaff} />
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400">
        Tenggara Sports &copy; {new Date().getFullYear()} — Sistem Kehadiran Staff
      </footer>
    </div>
  );
}
