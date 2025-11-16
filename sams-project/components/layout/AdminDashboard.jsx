import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import OverviewSection from '../section/OverviewSection';
import { useState } from 'react';

export default function AdminDashboard({ user, overview, users = [], classes = [], subjects = [] }) {
  const [activeSection, setActiveSection] = useState('overview');

  const studentUsers = users.filter(u => u.role === 'student');
  const teacherUsers = users.filter(u => u.role === 'teacher');

  return (
    <main className="min-h-screen bg-gray-100 font-sans flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <section className="flex-1 p-6 md:p-8 bg-white rounded-xl border border-gray-200 shadow-md">
          <DashboardHeader user={user} />

          {activeSection === 'overview' && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/80">
                  <h2 className="text-xs font-semibold text-blue-700 tracking-wide uppercase mb-1">Administrator</h2>
                  <p className="text-sm text-gray-800">
                    Manages subjects, students, teachers, and class assignments.
                  </p>
                  <p className="mt-1 text-xs text-blue-900/70">
                    Generates overall attendance reports and system-wide analytics.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
                  <h2 className="text-xs font-semibold text-emerald-700 tracking-wide uppercase mb-1">Teacher</h2>
                  <p className="text-sm text-gray-800">
                    Logs in to record attendance for assigned classes.
                  </p>
                  <p className="mt-1 text-xs text-emerald-900/70">
                    Updates attendance (Present, Late, Absent) and generates summaries per subject.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50">
                  <h2 className="text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-1">Student</h2>
                  <p className="text-sm text-gray-800">
                    Logs in to view their personal attendance record and percentage.
                  </p>
                  <p className="mt-1 text-xs text-indigo-900/70">
                    Monitors absences and present rates across enrolled subjects.
                  </p>
                </div>
              </section>

              <OverviewSection overview={overview} />

              <section className="mt-6 border border-gray-200 rounded-xl p-4 md:p-5 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Quick snapshot of your community</h3>
                    <p className="text-xs text-gray-600">Students, teachers, and classes overview in one place.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Students: {overview?.studentCount ?? '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Teachers: {overview?.teacherCount ?? '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      Classes: {overview?.classCount ?? '—'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Use the sections in the left sidebar to drill down into each area (Students, Teachers, Classes,
                  Subjects) and perform add, edit, update, and delete operations.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Students</h2>
                  <p className="text-sm text-gray-600">Manage registered students and their enrollments.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add student
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentUsers.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2 text-gray-900">{s.name}</td>
                        <td className="px-4 py-2 text-gray-700">{s.email}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {studentUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No students found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'teachers' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Teachers</h2>
                  <p className="text-sm text-gray-600">Manage teacher accounts and assignments.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add teacher
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teacherUsers.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{t.id}</td>
                        <td className="px-4 py-2 text-gray-900">{t.name}</td>
                        <td className="px-4 py-2 text-gray-700">{t.email}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {teacherUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No teachers found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'classes' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Classes / Sections</h2>
                  <p className="text-sm text-gray-600">Existing classes that group students and subjects.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add class
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classes.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{c.id}</td>
                        <td className="px-4 py-2 text-gray-900">{c.name}</td>
                        <td className="px-4 py-2 text-gray-700">{c.description || '—'}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {classes.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No classes configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'subjects' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Subjects</h2>
                  <p className="text-sm text-gray-600">Subjects that teachers can teach and students can enroll in.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add subject
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjects.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2 text-gray-900">{s.code || '—'}</td>
                        <td className="px-4 py-2 text-gray-900">{s.name}</td>
                        <td className="px-4 py-2 text-gray-700">{s.description || '—'}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subjects.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No subjects configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Attendance overview</h2>
                <p className="text-sm text-gray-600">
                  Review attendance by department, class, and month. This view is a starting point for analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Department focus</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Filter attendance grouped by department (e.g. BSIT, BSHM, BSCJ) and see present/late/absent trends.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Monthly trend</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Select a month to highlight spikes in absences and late arrivals across all classes.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">At-risk students</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Identify students with low attendance percentages for follow-up and intervention.
                  </p>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 text-xs text-gray-500">
                This area can later be connected to real aggregated attendance data and charts (per department, per
                class, per month).
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Reports & printing</h2>
                <p className="text-sm text-gray-600">
                  Generate attendance reports and summaries by student, subject, or date range.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Per-student report</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Generate a detailed attendance summary for a single student across all subjects.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Per-subject report</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Summarize attendance by subject, class, and teacher for a selected period.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Printable export</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Prepare a print-ready or downloadable copy of the selected report (PDF/Excel).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-blue-200 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    Print / download
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Notifications from teachers</h2>
                <p className="text-sm text-gray-600">
                  Review reports and notifications submitted by teachers for administrator follow-up.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Unread
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Resolved
                  </button>
                </div>
                <div className="text-xs text-gray-500">Future: connect to a notifications table or messaging system.</div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">From</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Message</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">Sample teacher</td>
                      <td className="px-4 py-2 text-gray-700">Attendance concern</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">
                        Placeholder notification. Connect this table to real teacher reports and messages.
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs">
                          Unread
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
