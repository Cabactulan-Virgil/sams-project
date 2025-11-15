"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";

import AdminOverview from "./AdminOverview";
import AdminClasses from "./AdminClasses";
import AdminSubjects from "./AdminSubjects";
import AdminEnrollment from "./AdminEnrollment";
import { FiHome, FiBookOpen, FiLayers, FiUserCheck } from "react-icons/fi";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ClassItem = {
  id: number;
  name: string;
  section: string | null;
  schoolYear: string | null;
  createdAt: string;
};

type SubjectItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
};

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AdminSection = "overview" | "classes" | "subjects" | "enrollment";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<UserItem[]>([]);
  const [teachers, setTeachers] = useState<UserItem[]>([]);

  const [className, setClassName] = useState("");
  const [classSection, setClassSection] = useState("");
  const [classSchoolYear, setClassSchoolYear] = useState("");
  const [savingClass, setSavingClass] = useState(false);

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [savingSubject, setSavingSubject] = useState(false);

  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollTeacherId, setEnrollTeacherId] = useState("");
  const [enrollSubjectId, setEnrollSubjectId] = useState("");
  const [enrollClassId, setEnrollClassId] = useState("");
  const [savingEnrollment, setSavingEnrollment] = useState(false);

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FiHome /> },
    { id: "classes", label: "Classes", icon: <FiLayers /> },
    { id: "subjects", label: "Subjects", icon: <FiBookOpen /> },
    { id: "enrollment", label: "Enrollments", icon: <FiUserCheck /> },
  ];

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

        if (!parsedUser || parsedUser.role !== "admin") {
          setError("This page is only available for administrator accounts.");
          return;
        }

        const [classesRes, subjectsRes, studentsRes, teachersRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/subjects"),
          fetch("/api/users?role=student"),
          fetch("/api/users?role=teacher"),
        ]);

        if (!classesRes.ok || !subjectsRes.ok || !studentsRes.ok || !teachersRes.ok) {
          throw new Error("Failed to load data.");
        }

        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const studentsData = await studentsRes.json();
        const teachersData = await teachersRes.json();

        setClasses(classesData.classes || []);
        setSubjects(subjectsData.subjects || []);
        setStudents(studentsData.users || []);
        setTeachers(teachersData.users || []);
      } catch (e) {
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  function resetMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleCreateClass(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    if (!className.trim()) {
      setError("Class name is required.");
      return;
    }

    setSavingClass(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: className.trim(),
          section: classSection.trim() || null,
          schoolYear: classSchoolYear.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create class.");
        return;
      }

      setMessage("Class created.");
      setClassName("");
      setClassSection("");
      setClassSchoolYear("");

      const refreshed = await fetch("/api/classes");
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setClasses(refreshedData.classes || []);
      }
    } catch {
      setError("Failed to create class.");
    } finally {
      setSavingClass(false);
    }
  }

  async function handleCreateSubject(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    if (!subjectCode.trim() || !subjectName.trim()) {
      setError("Subject code and name are required.");
      return;
    }

    setSavingSubject(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: subjectCode.trim(),
          name: subjectName.trim(),
          description: subjectDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subject.");
        return;
      }

      setMessage("Subject created.");
      setSubjectCode("");
      setSubjectName("");
      setSubjectDescription("");

      const refreshed = await fetch("/api/subjects");
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setSubjects(refreshedData.subjects || []);
      }
    } catch {
      setError("Failed to create subject.");
    } finally {
      setSavingSubject(false);
    }
  }

  async function handleCreateEnrollment(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    if (!enrollStudentId || !enrollTeacherId || !enrollSubjectId) {
      setError("Student, teacher, and subject are required for enrollment.");
      return;
    }

    setSavingEnrollment(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: Number(enrollStudentId),
          teacherId: Number(enrollTeacherId),
          subjectId: Number(enrollSubjectId),
          classId: enrollClassId ? Number(enrollClassId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create enrollment.");
        return;
      }

      setMessage("Enrollment created.");
      setEnrollStudentId("");
      setEnrollTeacherId("");
      setEnrollSubjectId("");
      setEnrollClassId("");
    } catch {
      setError("Failed to create enrollment.");
    } finally {
      setSavingEnrollment(false);
    }
  }

  function handleSectionClick(section: AdminSection) {
    setActiveSection(section);
  }

  function handleToggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  function handleToggleProfile() {
    setIsProfileOpen((prev) => !prev);
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
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error && (!currentUser || currentUser.role !== "admin")) {
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
        <aside
          className={`hidden min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-3 py-6 text-slate-100 md:flex md:flex-col ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-2">
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-50">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                {isSidebarOpen && (
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold leading-tight">{currentUser.name}</p>
                    <p className="max-w-[150px] truncate text-[11px] text-slate-300">{currentUser.email}</p>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100 hover:bg-slate-700"
              aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? "«" : ">"}
            </button>
          </div>

          {isSidebarOpen && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Navigation</p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                  activeSection === item.id
                    ? "bg-slate-100 text-slate-900 shadow-sm"
                    : "text-slate-200 hover:bg-slate-700/70 hover:text-white"
                }`}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </span>
              </button>
            ))}
          </nav>

          {currentUser && (
            <div className="mt-auto rounded-lg bg-slate-800/70 px-3 py-3 text-[11px] text-slate-300">
              {isSidebarOpen && (
                <>
                  <p className="mb-1 text-[11px] font-semibold text-slate-200">Signed in as</p>
                  <p className="truncate">{currentUser.name}</p>
                  <p className="truncate">{currentUser.email}</p>
                </>
              )}
              {!isSidebarOpen && (
                <p className="text-center text-[10px] text-slate-300">Signed in</p>
              )}
            </div>
          )}
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex flex-col items-start justify-between gap-3 border-b border-zinc-200 px-4 pb-4 dark:border-zinc-800 md:flex-row md:items-center md:px-8">
            <div className="flex w-full items-center justify-between gap-3 md:w-auto">
              <div>
                <h1 className="text-2xl font-semibold">Admin dashboard</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage classes, subjects, and enrollments for the attendance system.
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
            {activeSection === "overview" && (
              <AdminOverview
                classesCount={classes.length}
                subjectsCount={subjects.length}
                usersCount={students.length + teachers.length}
              />
            )}

            {activeSection === "classes" && (
              <AdminClasses
                className={className}
                classSection={classSection}
                classSchoolYear={classSchoolYear}
                savingClass={savingClass}
                classes={classes}
                onClassNameChange={setClassName}
                onClassSectionChange={setClassSection}
                onClassSchoolYearChange={setClassSchoolYear}
                onSubmit={handleCreateClass}
              />
            )}

            {activeSection === "subjects" && (
              <AdminSubjects
                subjectCode={subjectCode}
                subjectName={subjectName}
                subjectDescription={subjectDescription}
                savingSubject={savingSubject}
                subjects={subjects}
                onSubjectCodeChange={setSubjectCode}
                onSubjectNameChange={setSubjectName}
                onSubjectDescriptionChange={setSubjectDescription}
                onSubmit={handleCreateSubject}
              />
            )}

            {activeSection === "enrollment" && (
              <AdminEnrollment
                enrollStudentId={enrollStudentId}
                enrollTeacherId={enrollTeacherId}
                enrollSubjectId={enrollSubjectId}
                enrollClassId={enrollClassId}
                savingEnrollment={savingEnrollment}
                classes={classes}
                subjects={subjects}
                students={students}
                teachers={teachers}
                onEnrollStudentChange={setEnrollStudentId}
                onEnrollTeacherChange={setEnrollTeacherId}
                onEnrollSubjectChange={setEnrollSubjectId}
                onEnrollClassChange={setEnrollClassId}
                onSubmit={handleCreateEnrollment}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
