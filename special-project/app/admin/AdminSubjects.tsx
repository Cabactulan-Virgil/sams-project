"use client";

import { FC, FormEvent } from "react";

type SubjectItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
};

type Props = {
  subjectCode: string;
  subjectName: string;
  subjectDescription: string;
  savingSubject: boolean;
  subjects: SubjectItem[];
  onSubjectCodeChange: (value: string) => void;
  onSubjectNameChange: (value: string) => void;
  onSubjectDescriptionChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

const AdminSubjects: FC<Props> = ({
  subjectCode,
  subjectName,
  subjectDescription,
  savingSubject,
  subjects,
  onSubjectCodeChange,
  onSubjectNameChange,
  onSubjectDescriptionChange,
  onSubmit,
}) => {
  return (
    <section
      id="subjects"
      aria-label="Manage subjects"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Subjects</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Add subjects and describe what each covers.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Code
          </label>
          <input
            type="text"
            value={subjectCode}
            onChange={(e) => onSubjectCodeChange(e.target.value)}
            placeholder="IT101"
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Name
          </label>
          <input
            type="text"
            value={subjectName}
            onChange={(e) => onSubjectNameChange(e.target.value)}
            placeholder="e.g. Introduction to IT"
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Description (optional)
          </label>
          <textarea
            value={subjectDescription}
            onChange={(e) => onSubjectDescriptionChange(e.target.value)}
            placeholder="Short summary of what this subject covers"
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={savingSubject}
          className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {savingSubject ? "Saving..." : "Save subject"}
        </button>
      </form>

      <div className="mt-4 max-h-40 overflow-auto border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
        <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-200">Existing subjects</p>
        {subjects.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No subjects yet.</p>
        ) : (
          <ul className="space-y-1">
            {subjects.map((subj) => (
              <li key={subj.id} className="flex justify-between gap-2 text-[11px]">
                <span className="font-medium">{subj.code}</span>
                <span className="truncate text-zinc-500 dark:text-zinc-400">{subj.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AdminSubjects;
