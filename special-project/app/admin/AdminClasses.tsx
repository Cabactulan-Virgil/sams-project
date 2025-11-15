"use client";

import { FC, FormEvent } from "react";

type ClassItem = {
  id: number;
  name: string;
  section: string | null;
  schoolYear: string | null;
  createdAt: string;
};

type Props = {
  className: string;
  classSection: string;
  classSchoolYear: string;
  savingClass: boolean;
  classes: ClassItem[];
  onClassNameChange: (value: string) => void;
  onClassSectionChange: (value: string) => void;
  onClassSchoolYearChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

const AdminClasses: FC<Props> = ({
  className,
  classSection,
  classSchoolYear,
  savingClass,
  classes,
  onClassNameChange,
  onClassSectionChange,
  onClassSchoolYearChange,
  onSubmit,
}) => {
  return (
    <section
      id="classes"
      aria-label="Manage classes"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Classes</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Create class groups and keep track of existing sections.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Name
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => onClassNameChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Section (optional)
          </label>
          <input
            type="text"
            value={classSection}
            onChange={(e) => onClassSectionChange(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            School year (optional)
          </label>
          <input
            type="text"
            value={classSchoolYear}
            onChange={(e) => onClassSchoolYearChange(e.target.value)}
            placeholder="2024-2025"
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>
        <button
          type="submit"
          disabled={savingClass}
          className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {savingClass ? "Saving..." : "Save class"}
        </button>
      </form>

      <div className="mt-4 max-h-40 overflow-auto border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
        <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-200">Existing classes</p>
        {classes.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No classes yet.</p>
        ) : (
          <ul className="space-y-1">
            {classes.map((cls) => (
              <li key={cls.id} className="flex justify-between gap-2 text-[11px]">
                <span className="font-medium">{cls.name}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {cls.section || ""}
                  {cls.schoolYear ? ` • ${cls.schoolYear}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AdminClasses;
