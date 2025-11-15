"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.user) {
        try {
          window.localStorage.setItem("currentUser", JSON.stringify(data.user));
        } catch {
          // ignore storage errors
        }
      }

      const role = data.user?.role as string | undefined;
      if (role === "admin" || role === "student" || role === "teacher") {
        window.location.href = `/${role}`;
      } else {
        setError("Logged in but no valid role found.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-slate-100 px-4 py-8 font-sans dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-center justify-center gap-8 md:flex-row">
        <section className="hidden flex-1 flex-col gap-4 text-slate-900 dark:text-slate-50 md:flex">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Welcome to
          </p>
          <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
            Student Attendance Monitoring System
          </h1>
          <p className="max-w-md text-sm text-slate-700 dark:text-slate-300">
            Manage, monitor, and record attendance with ease and efficiency.
          </p>
          <div className="mt-2 grid gap-3 text-xs text-slate-700 dark:text-slate-300 sm:grid-cols-2">
            <div className="rounded-lg bg-white/70 p-3 shadow-sm backdrop-blur dark:bg-slate-900/60">
              <p className="font-medium">Smart overview</p>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                Admins can track classes, subjects, and attendance trends in one place.
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 shadow-sm backdrop-blur dark:bg-slate-900/60">
              <p className="font-medium">Teacher &amp; student friendly</p>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                Teachers record daily attendance; students view their logs and percentages.
              </p>
            </div>
          </div>
        </section>

        <main className="w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-lg backdrop-blur dark:bg-slate-950">
          <h2 className="mb-2 text-center text-2xl font-semibold text-black dark:text-zinc-50">
            Sign in to your account
          </h2>
          <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Use your registered email and password as a student, teacher, or admin.
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-black underline-offset-4 hover:underline dark:text-zinc-50"
            >
              Register
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
