"use client";

import { FC } from "react";
import { FiHome } from "react-icons/fi";

type SidebarProps = {
  name: string;
  email: string;
  isOpen: boolean;
  onToggle: () => void;
};

const StudentSidebar: FC<SidebarProps> = ({ name, email, isOpen, onToggle }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside
      className={`hidden min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-3 py-6 text-slate-100 md:flex md:flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-50">
            {initial}
          </div>
          {isOpen && (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold leading-tight">{name}</p>
              <p className="max-w-[150px] truncate text-[11px] text-slate-300">{email}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100 hover:bg-slate-700"
          aria-label={isOpen ? "Minimize sidebar" : "Expand sidebar"}
        >
          {isOpen ? "«" : ">"}
        </button>
      </div>

      {isOpen && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Navigation</p>
      )}
      <nav className="space-y-1">
        <button
          type="button"
          className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700/70 hover:text-white"
          aria-current="page"
        >
          <span className="flex items-center gap-2">
            <span className="text-sm">
              <FiHome />
            </span>
            {isOpen && <span>Attendance summary</span>}
          </span>
        </button>
      </nav>

      <div className="mt-auto rounded-lg bg-slate-800/70 px-3 py-3 text-[11px] text-slate-300">
        {isOpen ? (
          <>
            <p className="mb-1 text-[11px] font-semibold text-slate-200">Signed in as</p>
            <p className="truncate">{name}</p>
            <p className="truncate">{email}</p>
          </>
        ) : (
          <p className="text-center text-[10px] text-slate-300">Signed in</p>
        )}
      </div>
    </aside>
  );
};

export default StudentSidebar;
