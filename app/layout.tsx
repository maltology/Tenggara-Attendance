import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenggara Attendance | Sistem Kehadiran",
  description: "Sistem pengurusan kehadiran staff Tenggara Sports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
