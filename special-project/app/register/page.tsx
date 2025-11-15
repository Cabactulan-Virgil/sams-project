"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [program, setProgram] = useState("");
  const [course, setCourse] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "teacher") {
      if (!program.trim() || !course.trim() || !level.trim()) {
        setError("Program, course, and level are required for teachers.");
        return;
      }
    }

    if (role === "student") {
      if (!department.trim() || !yearLevel.trim()) {
        setError("Department and year are required for students.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: { [key: string]: unknown } = {
        name,
        email,
        password,
        role,
      };

      if (role === "teacher") {
        payload.program = program.trim();
        payload.course = course.trim();
        payload.level = level.trim();
      }

      if (role === "student") {
        payload.department = department.trim();
        payload.yearLevel = yearLevel.trim();
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Registration successful. You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("student");
      setProgram("");
      setCourse("");
      setLevel("");
      setDepartment("");
      setYearLevel("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-center text-2xl font-semibold text-black dark:text-zinc-50">
          Register
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Create a student or teacher account.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your school email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secure password"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Role
            </label>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {role === "teacher" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Program
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BSIT, BSED"
                  required={role === "teacher"}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Course
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. IT 101, English 1"
                  required={role === "teacher"}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Level
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g. 1st Year, Grade 10"
                  required={role === "teacher"}
                />
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Department
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. College of IT, SHS"
                  required={role === "student"}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Year
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  placeholder="e.g. 1st Year, Grade 11"
                  required={role === "student"}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-medium text-black underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Login
          </Link>
        </p>
      </main>
    </div>
  );
}
