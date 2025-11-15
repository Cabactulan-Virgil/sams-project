"use client";

import { FC, FormEvent } from "react";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: string;
  program: string | null;
  course: string | null;
  level: string | null;
  department: string | null;
  yearLevel: string | null;
};

type Props = {
  users: UserItem[];
  formName: string;
  formEmail: string;
  formRole: string;
  formPassword: string;
  formProgram: string;
  formCourse: string;
  formLevel: string;
  formDepartment: string;
  formYearLevel: string;
  editingUserId: number | null;
  savingUser: boolean;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onEditUser: (user: UserItem) => void;
  onDeleteUser: (id: number) => void;
  onCancelEdit: () => void;
};

const AdminUsers: FC<Props> = ({
  users,
  formName,
  formEmail,
  formRole,
  formPassword,
  formProgram,
  formCourse,
  formLevel,
  formDepartment,
  formYearLevel,
  editingUserId,
  savingUser,
  onFieldChange,
  onSubmit,
  onEditUser,
  onDeleteUser,
  onCancelEdit,
}) => {
  const isEditing = editingUserId != null;
  const showTeacherFields = formRole === "teacher";
  const showStudentFields = formRole === "student";

  return (
    <section
      id="users"
      aria-label="Manage users"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Users</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isEditing ? "Update an existing account." : "Create new admin, teacher, or student accounts."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              required
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Role</label>
            <select
              value={formRole}
              onChange={(e) => onFieldChange("role", e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!isEditing && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Password</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => onFieldChange("password", e.target.value)}
                placeholder="Initial password"
                className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                required
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel edit
            </button>
          )}
          <button
            type="submit"
            disabled={savingUser}
            className="ml-auto inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {savingUser ? "Saving..." : isEditing ? "Update user" : "Create user"}
          </button>
        </div>
      </form>

      <div className="mt-4 max-h-48 overflow-auto border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
        <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-200">Existing users</p>
        {users.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No users yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Name</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Email</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">Role</th>
                <th className="px-3 py-2 text-right font-medium text-zinc-700 dark:text-zinc-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2 align-middle text-[11px] font-medium text-zinc-800 dark:text-zinc-100">
                    {user.name}
                  </td>
                  <td className="px-3 py-2 align-middle text-[11px] text-zinc-600 dark:text-zinc-300">
                    {user.email}
                  </td>
                  <td className="px-3 py-2 align-middle text-[11px] text-zinc-600 dark:text-zinc-300">
                    {user.role}
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <button
                      type="button"
                      onClick={() => onEditUser(user)}
                      className="mr-2 inline-flex items-center rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteUser(user.id)}
                      className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/70 dark:bg-red-950/40 dark:text-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminUsers;
