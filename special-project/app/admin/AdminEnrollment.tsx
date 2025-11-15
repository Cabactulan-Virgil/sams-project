"use client";

import { FC, FormEvent } from "react";

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

type Props = {
  enrollStudentId: string;
  enrollTeacherId: string;
  enrollSubjectId: string;
  enrollClassId: string;
  savingEnrollment: boolean;
  classes: ClassItem[];
  subjects: SubjectItem[];
  students: UserItem[];
  teachers: UserItem[];
  onEnrollStudentChange: (value: string) => void;
  onEnrollTeacherChange: (value: string) => void;
  onEnrollSubjectChange: (value: string) => void;
  onEnrollClassChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

const AdminEnrollment: FC<Props> = ({
  enrollStudentId,
  enrollTeacherId,
  enrollSubjectId,
  enrollClassId,
  savingEnrollment,
  classes,
  subjects,
  students,
  teachers,
  onEnrollStudentChange,
  onEnrollTeacherChange,
  onEnrollSubjectChange,
  onEnrollClassChange,
  onSubmit,
}) => {
  return (
    <section
      id="enrollment"
      aria-label="Enroll students"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Enroll students</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Connect students, teachers, subjects, and classes.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Student
          </label>
          <select
            value={enrollStudentId}
            onChange={(e) => onEnrollStudentChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Teacher
          </label>
          <select
            value={enrollTeacherId}
            onChange={(e) => onEnrollTeacherChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Subject
          </label>
          <select
            value={enrollSubjectId}
            onChange={(e) => onEnrollSubjectChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          >
            <option value="">Select subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.code} — {subj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Class (optional)
          </label>
          <select
            value={enrollClassId}
            onChange={(e) => onEnrollClassChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          >
            <option value="">No specific class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `(${cls.section})` : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={savingEnrollment}
          className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {savingEnrollment ? "Saving..." : "Save enrollment"}
        </button>
      </form>

      <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        Enrollments are visible to teachers on their attendance page.
      </p>
    </section>
  );
};

export default AdminEnrollment;
