"use client";

import { FC } from "react";

type Props = {
  classesCount: number;
  subjectsCount: number;
  usersCount: number;
};

const AdminOverview: FC<Props> = ({ classesCount, subjectsCount, usersCount }) => {
  return (
    <section
      id="overview"
      aria-label="Overview"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Overview</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          A quick snapshot of your current setup.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="mb-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Classes</p>
          <p className="text-lg font-semibold">{classesCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total active classes</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="mb-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Subjects</p>
          <p className="text-lg font-semibold">{subjectsCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Subjects you can assign</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="mb-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Users</p>
          <p className="text-lg font-semibold">{usersCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Students and teachers</p>
        </div>
      </div>
    </section>
  );
};

export default AdminOverview;
