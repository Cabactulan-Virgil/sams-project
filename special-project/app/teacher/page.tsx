"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type EnrollmentItem = {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  teacher_id: number;
  teacher_name: string;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  class_id: number | null;
  class_name: string | null;
  section: string | null;
  school_year: string | null;
  created_at: string;
};

const ATTENDANCE_STATUSES = ["present", "late", "absent"] as const;
type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export default function TeacherPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [classFilter, setClassFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving] = useState(false);

  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        let parsedUser: CurrentUser | null = null;
        try {
          const stored = window.localStorage.getItem("currentUser");
          if (stored) {
            parsedUser = JSON.parse(stored) as CurrentUser;
            setCurrentUser(parsedUser);
          }
        } catch {
          parsedUser = null;
        }

        if (!parsedUser || parsedUser.role !== "teacher") {
          setError("This page is only available for teacher accounts.");
          return;
        }

        const res = await fetch(`/api/enrollments?teacherId=${parsedUser.id}`);
        if (!res.ok) {
          throw new Error("Failed to load enrollments.");
        }

        const data = await res.json();
        const list = (data.enrollments || []) as EnrollmentItem[];
        setEnrollments(list);

        const initialStatuses: Record<number, AttendanceStatus> = {};
        for (const e of list) {
          initialStatuses[e.enrollment_id] = "present";
        }
        setStatuses(initialStatuses);
      } catch (e) {
        setError("Failed to load teacher data.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const uniqueClasses = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>();
    for (const e of enrollments) {
      if (e.class_id && !map.has(e.class_id)) {
        const label = `${e.class_name ?? "Class"}${e.section ? ` (${e.section})` : ""}`;
        map.set(e.class_id, { id: e.class_id, label });
      }
    }
    return Array.from(map.values());
  }, [enrollments]);

  const uniqueSubjects = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>();
    for (const e of enrollments) {
      if (!map.has(e.subject_id)) {
        map.set(e.subject_id, {
          id: e.subject_id,
          label: `${e.subject_code} — ${e.subject_name}`,
        });
      }
    }
    return Array.from(map.values());
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      if (classFilter && String(e.class_id) !== classFilter) return false;
      if (subjectFilter && String(e.subject_id) !== subjectFilter) return false;
      return true;
    });
  }, [enrollments, classFilter, subjectFilter]);

  function resetMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleSaveAttendance(e: FormEvent) {
    e.preventDefault();
    resetMessages();

    if (!currentUser) {
      setError("No teacher information found. Please log in again.");
      return;
    }

    if (!attendanceDate) {
      setError("Please select a date.");
      return;
    }

    if (filteredEnrollments.length === 0) {
      setError("No students found for the selected filters.");
      return;
    }

    setSaving(true);
    try {
      const payloads = filteredEnrollments.map((row) => ({
        enrollmentId: row.enrollment_id,
        attendanceDate,
        status: statuses[row.enrollment_id] || "present",
        recordedBy: currentUser.id,
        remarks: null,
      }));

      const results = await Promise.all(
        payloads.map((p) =>
          fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          })
        )
      );

      const hasError = results.some((res) => !res.ok);
      if (hasError) {
        setError("Some attendance records could not be saved.");
      } else {
        setMessage("Attendance saved for selected students.");
      }
    } catch {
      setError("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  function handleStatusChange(enrollmentId: number, value: string) {
    if (!ATTENDANCE_STATUSES.includes(value as AttendanceStatus)) return;
    setStatuses((prev) => ({ ...prev, [enrollmentId]: value as AttendanceStatus }));
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem("currentUser");
    } catch {
    }
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading teacher dashboard...</p>
      </div>
    );
  }

  if (error && (!currentUser || currentUser.role !== "teacher")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-md dark:bg-zinc-900">
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            Go to login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Teacher dashboard</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View your assigned students and record attendance for your classes.
            </p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{currentUser.name}</div>
                <div>{currentUser.email}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/70 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <form onSubmit={handleSaveAttendance} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Class
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                >
                  <option value="">All classes</option>
                  {uniqueClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Subject
                </label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                >
                  <option value="">All subjects</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                  required
                />
              </div>
            </div>

            <div className="mt-4 max-h-80 overflow-auto rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      Student
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      Class
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      Subject
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        No students found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((row) => (
                      <tr key={row.enrollment_id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/60">
                        <td className="px-3 py-2 align-middle">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {row.student_name}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {row.student_email}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-middle text-[11px] text-zinc-600 dark:text-zinc-300">
                          {row.class_name || "—"}
                          {row.section ? ` (${row.section})` : ""}
                        </td>
                        <td className="px-3 py-2 align-middle text-[11px] text-zinc-600 dark:text-zinc-300">
                          <div className="font-medium">{row.subject_code}</div>
                          <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {row.subject_name}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <select
                            value={statuses[row.enrollment_id] || "present"}
                            onChange={(ev) =>
                              handleStatusChange(row.enrollment_id, ev.target.value)
                            }
                            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                          >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving ? "Saving attendance..." : "Save attendance"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            Tip: use the class and subject filters above to narrow down the list before
            saving attendance.
          </p>
        </section>
      </div>
    </div>
  );
}
