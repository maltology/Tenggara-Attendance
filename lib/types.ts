export interface Staff {
  id: string;
  name: string;
  position?: string;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut: string; // HH:mm
  totalHours: number;
  notes?: string;
  createdAt: string;
}

export interface SummaryStats {
  staffId: string;
  staffName: string;
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  totalRecords: number;
}
