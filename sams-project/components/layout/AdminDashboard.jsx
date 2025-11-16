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
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Administrator</h2>
                  <p className="text-sm text-gray-700">
                    Manages subjects, students, teachers, and class assignments.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Generates overall attendance reports and system-wide analytics.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Teacher</h2>
                  <p className="text-sm text-gray-700">
                    Logs in to record attendance for assigned classes.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Updates attendance (Present, Late, Absent) and generates summaries per subject.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Student</h2>
                  <p className="text-sm text-gray-700">
                    Logs in to view their personal attendance record and percentage.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Monitors absences and present rates across enrolled subjects.
                  </p>
                </div>
              </section>

              <OverviewSection overview={overview} />
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Students</h2>
              <p className="text-sm text-gray-600">Manage registered students and their enrollments.</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-800">
                {studentUsers.map(s => (
                  <li key={s.id}>{s.name} ({s.email})</li>
                ))}
                {studentUsers.length === 0 && (
                  <li className="text-xs text-gray-400">No students found yet.</li>
                )}
              </ul>
            </div>
          )}

          {activeSection === 'teachers' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Teachers</h2>
              <p className="text-sm text-gray-600">Manage teacher accounts and assignments.</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-800">
                {teacherUsers.map(t => (
                  <li key={t.id}>{t.name} ({t.email})</li>
                ))}
                {teacherUsers.length === 0 && (
                  <li className="text-xs text-gray-400">No teachers found yet.</li>
                )}
              </ul>
            </div>
          )}

          {activeSection === 'classes' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Classes / Sections</h2>
              <p className="text-sm text-gray-600">Existing classes that group students and subjects.</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-800">
                {classes.map(c => (
                  <li key={c.id}>{c.name}</li>
                ))}
                {classes.length === 0 && (
                  <li className="text-xs text-gray-400">No classes configured yet.</li>
                )}
              </ul>
            </div>
          )}

          {activeSection === 'subjects' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Subjects</h2>
              <p className="text-sm text-gray-600">Subjects that teachers can teach and students can enroll in.</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-800">
                {subjects.map(s => (
                  <li key={s.id}>{s.code ? `${s.code} - ${s.name}` : s.name}</li>
                ))}
                {subjects.length === 0 && (
                  <li className="text-xs text-gray-400">No subjects configured yet.</li>
                )}
              </ul>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Attendance overview</h2>
              <p className="text-sm text-gray-600">
                As an administrator you will be able to review attendance by department and filter absences by month.
              </p>
              <p className="text-xs text-gray-500">
                Next steps: connect this section to aggregated attendance data and charts (per department, per class, per
                month).
              </p>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Reports & printing</h2>
              <p className="text-sm text-gray-600">
                Generate overall attendance reports and summaries by student, subject, or date.
              </p>
              <p className="text-xs text-gray-500">
                This area will support printable views and export options for official reporting.
              </p>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Notifications from teachers</h2>
              <p className="text-sm text-gray-600">
                Here you will be able to review reports and notifications submitted by teachers.
              </p>
              <p className="text-xs text-gray-500">
                Placeholder  hook this up to a notification table or messaging system between teachers and admins.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
