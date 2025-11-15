"use client";

import { FC, FormEvent } from "react";

type SubjectOption = {
  subjectId: number;
  label: string;
};

type SummaryRow = {
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  classId: number | null;
  className: string | null;
  section: string | null;
  schoolYear: string | null;
  presentCount: number | null;
  lateCount: number | null;
  absentCount: number | null;
  totalSessions: number;
  attendancePercentage?: number | null;
};

type Props = {
  subjectId: string;
  startDate: string;
  endDate: string;
  subjectOptions: SubjectOption[];
  summaries: SummaryRow[];
  hasFiltersReady: boolean;
  loadingSummary: boolean;
  onSubjectChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

const StudentSummarySection: FC<Props> = ({
  subjectId,
  startDate,
  endDate,
  subjectOptions,
  summaries,
  hasFiltersReady,
  loadingSummary,
  onSubjectChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}) => {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            >
              <option value="">All subjects</option>
              {subjectOptions.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!hasFiltersReady || loadingSummary}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loadingSummary ? "Loading..." : "Load summary"}
          </button>
        </div>
      </form>

      <div className="mt-4 max-h-80 overflow-auto rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Subject</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Class</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Present</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Late</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Absent</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Sessions</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {summaries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400"
                >
                  No attendance data found for the selected range.
                </td>
              </tr>
            ) : (
              summaries.map((row, index) => (
                <tr key={`${row.subjectId}-${row.classId}-${index}`}>
                  <td className="px-3 py-2 align-middle">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.subjectCode}
                    </div>
                    <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {row.subjectName}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-[11px] text-zinc-600 dark:text-zinc-300">
                    {row.className || "—"}
                    {row.section ? ` (${row.section})` : ""}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.presentCount ?? 0}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.lateCount ?? 0}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.absentCount ?? 0}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.totalSessions}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {row.attendancePercentage != null
                      ? `${row.attendancePercentage.toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        Note: attendance percentage considers both Present and Late as attended sessions.
      </p>
    </section>
  );
};

export default StudentSummarySection;
