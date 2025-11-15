"use client";

import { FC, FormEvent, useEffect, useMemo, useState } from "react";

type SummaryRow = {
  department: string | null;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  totalSessions: number;
  attendanceRate: number | null;
};

const AdminReports: FC = () => {
  const [month, setMonth] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const initialMonth = `${yyyy}-${mm}`;
    setMonth(initialMonth);
    void loadSummary(initialMonth, "");
  }, []);

  async function loadSummary(selectedMonth: string, departmentFilter: string) {
    if (!selectedMonth) return;

    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr);
    if (!year || !monthIndex) return;

    const startDate = `${yearStr}-${monthStr}-01`;
    const lastDay = new Date(year, monthIndex, 0).getDate();
    const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (departmentFilter) {
        params.set("department", departmentFilter);
      }

      const res = await fetch(`/api/admin/attendance-summary?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load attendance summary.");
        setSummary([]);
        return;
      }

      setSummary((data.summary || []) as SummaryRow[]);
    } catch {
      setError("Failed to load attendance summary.");
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!month) return;
    void loadSummary(month, department);
  }

  const totals = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let sessions = 0;

    for (const row of summary) {
      present += row.presentCount;
      late += row.lateCount;
      absent += row.absentCount;
      sessions += row.totalSessions;
    }

    const attended = present + late;
    const rate = sessions > 0 ? Number(((attended * 100) / sessions).toFixed(2)) : null;

    return { present, late, absent, sessions, rate };
  }, [summary]);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <section
      id="reports"
      aria-label="Attendance reports"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Attendance reports</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            View monthly attendance by department and generate a printable summary.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Print report
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Department (optional)
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. BSIT, SHS"
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>

        <div className="flex items-end justify-start">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Loading..." : "Load report"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mt-2 max-h-80 overflow-auto rounded-md border border-zinc-200 bg-white text-xs dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Department</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Present</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Late</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Absent</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Sessions</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {summary.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400"
                >
                  No attendance data found for the selected month.
                </td>
              </tr>
            ) : (
              summary.map((row, idx) => (
                <tr key={`${row.department ?? "none"}-${idx}`}>
                  <td className="px-3 py-2 align-middle text-[11px] text-zinc-700 dark:text-zinc-200">
                    {row.department || "Unassigned"}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">{row.presentCount}</td>
                  <td className="px-3 py-2 align-middle text-center">{row.lateCount}</td>
                  <td className="px-3 py-2 align-middle text-center">{row.absentCount}</td>
                  <td className="px-3 py-2 align-middle text-center">{row.totalSessions}</td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.attendanceRate != null ? `${row.attendanceRate.toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {summary.length > 0 && (
        <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <p className="mb-1 font-semibold">Overall for selected filters</p>
          <p>
            Present: <span className="font-medium">{totals.present}</span> · Late:{" "}
            <span className="font-medium">{totals.late}</span> · Absent:{" "}
            <span className="font-medium">{totals.absent}</span> · Sessions:{" "}
            <span className="font-medium">{totals.sessions}</span>
            {totals.rate != null && (
              <>
                {" "}
                · Attendance:{" "}
                <span className="font-medium">{totals.rate.toFixed(2)}%</span>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
};

export default AdminReports;
