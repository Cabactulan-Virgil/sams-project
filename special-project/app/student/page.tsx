"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StudentSidebar from "./StudentSidebar";
import StudentSummarySection from "./StudentSummarySection";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

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

export default function StudentPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summaries, setSummaries] = useState<SummaryRow[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

        if (!parsedUser || parsedUser.role !== "student") {
          setError("This page is only available for student accounts.");
          return;
        }

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const firstDay = `${yyyy}-${mm}-01`;
        const lastDay = today.toISOString().slice(0, 10);
        setStartDate(firstDay);
        setEndDate(lastDay);

        const enrollRes = await fetch(`/api/enrollments?studentId=${parsedUser.id}`);
        if (!enrollRes.ok) {
          throw new Error("Failed to load enrollments.");
        }

        const enrollData = await enrollRes.json();
        const enrollments = (enrollData.enrollments || []) as {
          subject_id: number;
          subject_code: string;
          subject_name: string;
        }[];

        const optionsMap = new Map<number, SubjectOption>();
        for (const e of enrollments) {
          if (!optionsMap.has(e.subject_id)) {
            optionsMap.set(e.subject_id, {
              subjectId: e.subject_id,
              label: `${e.subject_code} — ${e.subject_name}`,
            });
          }
        }
        setSubjectOptions(Array.from(optionsMap.values()));
      } catch (e) {
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const hasFiltersReady = useMemo(() => {
    return !!startDate && !!endDate;
  }, [startDate, endDate]);

  function resetMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleLoadSummary(e: FormEvent) {
    e.preventDefault();
    resetMessages();

    if (!currentUser) {
      setError("No student information found. Please log in again.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoadingSummary(true);
    try {
      const params = new URLSearchParams({
        studentId: String(currentUser.id),
        startDate,
        endDate,
      });

      if (subjectId) {
        params.set("subjectId", subjectId);
      }

      const res = await fetch(`/api/student/attendance?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load attendance summary.");
        return;
      }

      setSummaries((data.summary || []) as SummaryRow[]);
      setMessage("Attendance summary updated.");
    } catch {
      setError("Failed to load attendance summary.");
    } finally {
      setLoadingSummary(false);
    }
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem("currentUser");
    } catch {
    }
    window.location.href = "/";
  }

  function handleToggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  function handleToggleProfile() {
    setIsProfileOpen((prev) => !prev);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading student dashboard...</p>
      </div>
    );
  }

  if (error && (!currentUser || currentUser.role !== "student")) {
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        {currentUser && (
          <StudentSidebar
            name={currentUser.name}
            email={currentUser.email}
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
          />
        )}

        {/* Right column */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex flex-col items-start justify-between gap-3 border-b border-zinc-200 px-4 pb-4 dark:border-zinc-800 md:flex-row md:items-center md:px-8">
            <div className="flex w-full items-center justify-between gap-3 md:w-auto">
              <div>
                <h1 className="text-2xl font-semibold">Student dashboard</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  View your attendance summary by subject and time period.
                </p>
              </div>
            </div>
            {currentUser && (
              <div className="relative flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <button
                  type="button"
                  onClick={handleToggleProfile}
                  className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-2 py-1 text-left text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{currentUser.name}</div>
                    <div className="max-w-[160px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {currentUser.email}
                    </div>
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border border-zinc-200 bg-white py-1 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          {error && (
            <div className="mx-4 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm dark:mx-8 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="mx-4 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow-sm dark:mx-8 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              {message}
            </div>
          )}

          <main className="flex-1 px-4 pb-6 pt-4 md:px-8 md:pb-8">
            <StudentSummarySection
              subjectId={subjectId}
              startDate={startDate}
              endDate={endDate}
              subjectOptions={subjectOptions}
              summaries={summaries}
              hasFiltersReady={hasFiltersReady}
              loadingSummary={loadingSummary}
              onSubjectChange={setSubjectId}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onSubmit={handleLoadSummary}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

