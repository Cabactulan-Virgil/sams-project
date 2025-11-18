import { useEffect, useState } from 'react';

export default function StudentDashboardShell({ user, summary, subjects = [] }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const filteredSubjects = (subjects || []).filter(subject => {
    if (!subjectSearch.trim()) return true;
    const term = subjectSearch.toLowerCase().trim();

    const code = (subject.subjectCode || '').toLowerCase();
    const name = (subject.subjectName || '').toLowerCase();
    const className = (subject.className || '').toLowerCase();
    const teacherName = (subject.teacherName || '').toLowerCase();

    return (
      code.includes(term) ||
      name.includes(term) ||
      className.includes(term) ||
      teacherName.includes(term)
    );
  });

  const presentCount = summary?.presentCount ?? 0;
  const lateCount = summary?.lateCount ?? 0;
  const absentCount = summary?.absentCount ?? 0;
  const totalSessions = summary?.totalSessions ?? 0;
  const attendancePercentage =
    summary?.attendancePercentage != null ? summary.attendancePercentage : null;

  useEffect(() => {
    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsError('');

      try {
        const res = await fetch('/api/student/notifications');
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load notifications');
        }

        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } catch (err) {
        setNotificationsError(err.message || 'Failed to load notifications');
      } finally {
        setNotificationsLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const sortedNotifications = [...(notifications || [])].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt) : 0;
    const bDate = b.createdAt ? new Date(b.createdAt) : 0;
    return bDate - aDate;
  });

  const sidebarButton = (section, label) => (
    <button
      type="button"
      onClick={() => setActiveSection(section)}
      className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
        activeSection === section
          ? 'bg-slate-800 text-slate-50'
          : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 bg-slate-900 text-slate-50 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">SAMS Student</h2>
          <nav className="space-y-1">
            {sidebarButton('overview', 'Dashboard overview')}
            {sidebarButton('subjects', 'Subjects')}
            {sidebarButton('attendance', 'Attendance summary')}
            {sidebarButton('notifications', 'Notifications')}
          </nav>
        </aside>

        <section className="flex-1 bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-700">
                Welcome, {user.name} ({user.email}).
              </p>
              <p className="text-xs text-gray-500">Role: {user.role}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700"
            >
              Logout
            </button>
          </header>

          {activeSection === 'overview' && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Overall attendance</h2>
                <p className="text-xs text-gray-600 mb-1">
                  Total sessions recorded: {totalSessions}
                </p>
                <p className="text-xs text-gray-600">
                  Attendance rate:{' '}
                  {attendancePercentage != null ? `${attendancePercentage}%` : '—'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">By status</h2>
                <dl className="grid grid-cols-3 gap-2 text-xs text-gray-700">
                  <div>
                    <dt className="text-gray-500">Present</dt>
                    <dd className="font-semibold text-emerald-700">{presentCount}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Late</dt>
                    <dd className="font-semibold text-amber-700">{lateCount}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Absent</dt>
                    <dd className="font-semibold text-red-700">{absentCount}</dd>
                  </div>
                </dl>
              </div>
            </section>
          )}

          {activeSection === 'subjects' && (
            <section className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Subjects</h2>
              <p className="text-xs text-gray-600 mb-3">
                These are the subjects you are currently enrolled in.
              </p>
              <div className="mb-3">
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  placeholder="Search by subject, class, or teacher..."
                  className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {filteredSubjects.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {filteredSubjects.map(subject => (
                    <li
                      key={subject.enrollmentId}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="text-sm font-semibold text-gray-900">
                        {subject.subjectCode
                          ? `${subject.subjectCode} · ${subject.subjectName || ''}`
                          : subject.subjectName || 'Untitled subject'}
                      </div>
                      {subject.className && (
                        <div className="text-xs text-gray-600">Class: {subject.className}</div>
                      )}
                      {subject.teacherName && (
                        <div className="text-xs text-gray-600">Teacher: {subject.teacherName}</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">
                  {subjects && subjects.length > 0
                    ? 'No subjects match your search.'
                    : 'You are not enrolled in any subjects yet.'}
                </p>
              )}
            </section>
          )}

          {activeSection === 'attendance' && (
            <section className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Attendance summary</h2>
              <p className="text-xs text-gray-600 mb-3">
                Summary based on all recorded attendance entries for your enrolled classes.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Student</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Email</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Present</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Late</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Absent</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="px-3 py-2 text-gray-900">{user.name}</td>
                      <td className="px-3 py-2 text-gray-700">{user.email}</td>
                      <td className="px-3 py-2 text-center text-gray-700">{presentCount}</td>
                      <td className="px-3 py-2 text-center text-gray-700">{lateCount}</td>
                      <td className="px-3 py-2 text-center text-gray-700">{absentCount}</td>
                      <td className="px-3 py-2 text-center text-gray-900">
                        {attendancePercentage != null ? `${attendancePercentage}%` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Notifications</h2>
              <p className="text-xs text-gray-600 mb-3">
                Messages from your teachers or administrators related to your attendance or subjects.
              </p>

              {notificationsLoading && (
                <p className="text-xs text-gray-500">Loading notifications...</p>
              )}

              {notificationsError && (
                <p className="text-xs text-red-600">{notificationsError}</p>
              )}

              {!notificationsLoading && !notificationsError && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  {sortedNotifications && sortedNotifications.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                      {sortedNotifications.map(notification => (
                        <li
                          key={notification.id}
                          className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <p className="text-gray-900 mb-1">{notification.message}</p>
                          <p className="text-[11px] text-gray-500">
                            {notification.createdAt
                              ? new Date(notification.createdAt).toLocaleString()
                              : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">No notifications yet.</p>
                  )}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
