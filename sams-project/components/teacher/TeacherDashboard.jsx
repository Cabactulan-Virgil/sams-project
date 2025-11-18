import { useState, useEffect } from 'react';
import TeacherSidebar from './TeacherSidebar';
import DashboardHeader from '../layout/DashboardHeader';

export default function TeacherDashboard({ user, classes = [], subjects = [], students = [] }) {
  const [activeSection, setActiveSection] = useState('overview');

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState('');

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionElapsedMinutes, setSessionElapsedMinutes] = useState(0);
  const [sessionFlags, setSessionFlags] = useState({
    warned13: false,
    markedLate: false,
    warned28: false,
    markedAbsent: false,
  });

  const [studentsSearch, setStudentsSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [studentsSummary, setStudentsSummary] = useState([]);

  const [reportsSubjectId, setReportsSubjectId] = useState('');
  const [reportsFrom, setReportsFrom] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [reportsData, setReportsData] = useState([]);

  const [attendanceFilterName, setAttendanceFilterName] = useState('');
  const [attendanceFilterDepartment, setAttendanceFilterDepartment] = useState('');
  const [attendanceFilterYear, setAttendanceFilterYear] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsError('');

      try {
        const res = await fetch('/api/teacher/notifications');
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

  async function handleLoadAttendanceStudents(e) {
    e.preventDefault();
    setAttendanceError('');
    setAttendanceSuccess('');

    if (!classId || !subjectId) {
      setAttendanceError('Please enter class ID and subject ID.');
      return;
    }

    try {
      setAttendanceLoading(true);
      const params = new URLSearchParams({
        classId: classId.trim(),
        subjectId: subjectId.trim(),
      });
      const res = await fetch(`/api/teacher/attendance?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setAttendanceError(data.message || 'Failed to load students.');
        setAttendanceStudents([]);
        return;
      }

      const studentsData = data.students || [];
      setAttendanceStudents(studentsData);

      const initialStatus = {};
      studentsData.forEach(s => {
        if (attendanceStatus[s.enrollmentId]) {
          initialStatus[s.enrollmentId] = attendanceStatus[s.enrollmentId];
        }
      });
      setAttendanceStatus(initialStatus);
    } catch (err) {
      setAttendanceError('Something went wrong while loading students.');
    } finally {
      setAttendanceLoading(false);
    }
  }

  function handleStatusChange(enrollmentId, status) {
    setAttendanceStatus(prev => ({ ...prev, [enrollmentId]: status }));
  }

  async function handleSaveAttendance() {
    setAttendanceError('');
    setAttendanceSuccess('');

    if (!attendanceDate) {
      setAttendanceError('Please choose a date.');
      return;
    }

    if (!attendanceStudents.length) {
      setAttendanceError('Load students before saving attendance.');
      return;
    }

    try {
      setAttendanceSaving(true);

      const records = attendanceStudents.map(s => ({
        enrollmentId: s.enrollmentId,
        status: attendanceStatus[s.enrollmentId] || 'PRESENT',
      }));

      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: attendanceDate, records }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAttendanceError(data.message || 'Failed to save attendance.');
        return;
      }

      setAttendanceSuccess('Attendance has been saved.');
    } catch (err) {
      setAttendanceError('Something went wrong while saving attendance.');
    } finally {
      setAttendanceSaving(false);
    }
  }

  function autoMarkStatus(status) {
    setAttendanceStatus(prev => {
      const next = { ...prev };
      attendanceStudents.forEach(s => {
        if (!next[s.enrollmentId]) {
          next[s.enrollmentId] = status;
        }
      });
      return next;
    });
  }

  function recordArrival(enrollmentId) {
    if (!attendanceStudents.length) return;

    if (!sessionActive || !sessionStartTime) {
      handleStatusChange(enrollmentId, 'PRESENT');
      return;
    }

    const now = new Date();
    const elapsed = Math.floor((now - sessionStartTime) / 60000);
    let status = 'PRESENT';
    if (elapsed > 30) status = 'ABSENT';
    else if (elapsed > 15) status = 'LATE';
    handleStatusChange(enrollmentId, status);
  }

  function handleWarnMissing() {
    if (typeof window !== 'undefined') {
      window.alert('Please warn missing or unmarked students. They may be marked Late or Absent soon.');
    }
  }

  function handleRefreshSessionSummary() {
    setAttendanceStatus(prev => ({ ...prev }));
  }

  function handleStartSession() {
    if (!attendanceStudents.length) {
      setAttendanceError('Load students before starting a session.');
      return;
    }
    setSessionActive(true);
    setSessionStartTime(new Date());
    setSessionElapsedMinutes(0);
    setSessionFlags({ warned13: false, markedLate: false, warned28: false, markedAbsent: false });
  }

  function handleEndSession() {
    setSessionActive(false);
    setSessionStartTime(null);
    setSessionElapsedMinutes(0);
    setSessionFlags({ warned13: false, markedLate: false, warned28: false, markedAbsent: false });
  }

  useEffect(() => {
    if (!sessionActive || !sessionStartTime) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - sessionStartTime) / 60000);
      setSessionElapsedMinutes(elapsed);

      setSessionFlags(prev => {
        const next = { ...prev };

        if (elapsed >= 13 && !next.warned13) {
          next.warned13 = true;
          if (typeof window !== 'undefined') {
            window.alert('Warning: Students arriving after 15 minutes will be marked Late.');
          }
        }

        if (elapsed >= 15 && !next.markedLate) {
          next.markedLate = true;
          autoMarkStatus('LATE');
        }

        if (elapsed >= 28 && !next.warned28) {
          next.warned28 = true;
          if (typeof window !== 'undefined') {
            window.alert('Reminder: Students arriving after 30 minutes will be marked Absent.');
          }
        }

        if (elapsed >= 30 && !next.markedAbsent) {
          next.markedAbsent = true;
          autoMarkStatus('ABSENT');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionActive, sessionStartTime]);

  async function handleSearchStudents(e) {
    e.preventDefault();
    setStudentsError('');

    try {
      setStudentsLoading(true);
      const params = new URLSearchParams();
      if (studentsSearch.trim()) {
        params.set('q', studentsSearch.trim());
      }

      const res = await fetch(`/api/teacher/students${params.toString() ? `?${params.toString()}` : ''}`);
      const data = await res.json();

      if (!res.ok) {
        setStudentsError(data.message || 'Failed to load students.');
        setStudentsSummary([]);
        return;
      }

      setStudentsSummary(data.students || []);
    } catch (err) {
      setStudentsError('Something went wrong while loading students.');
      setStudentsSummary([]);
    } finally {
      setStudentsLoading(false);
    }
  }

  async function handleLoadReports(e) {
    e.preventDefault();
    setReportsError('');

    try {
      setReportsLoading(true);
      const params = new URLSearchParams();
      if (reportsSubjectId) params.set('subjectId', reportsSubjectId);
      if (reportsFrom) params.set('from', reportsFrom);
      if (reportsTo) params.set('to', reportsTo);

      const res = await fetch(`/api/teacher/reports${params.toString() ? `?${params.toString()}` : ''}`);
      const data = await res.json();

      if (!res.ok) {
        setReportsError(data.message || 'Failed to load reports.');
        setReportsData([]);
        return;
      }

      setReportsData(data.subjects || []);
    } catch (err) {
      setReportsError('Something went wrong while loading reports.');
      setReportsData([]);
    } finally {
      setReportsLoading(false);
    }
  }

  const filteredAttendanceStudents = attendanceStudents.filter(s => {
    const name = (s.name || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();
    const year = (s.year || '').toLowerCase();
    const nameFilter = attendanceFilterName.toLowerCase();
    const deptFilter = attendanceFilterDepartment.toLowerCase();
    const yearFilter = attendanceFilterYear.toLowerCase();
    if (nameFilter && !name.includes(nameFilter)) return false;
    if (deptFilter && !dept.includes(deptFilter)) return false;
    if (yearFilter && !year.includes(yearFilter)) return false;
    return true;
  });

  const sessionSummary = filteredAttendanceStudents.length
    ? filteredAttendanceStudents.reduce(
        (acc, student) => {
          const status = attendanceStatus[student.enrollmentId];
          acc.total += 1;
          if (!status) acc.unmarked += 1;
          else if (status === 'PRESENT') acc.present += 1;
          else if (status === 'LATE') acc.late += 1;
          else if (status === 'ABSENT') acc.absent += 1;
          return acc;
        },
        { total: 0, present: 0, late: 0, absent: 0, unmarked: 0 }
      )
    : { total: 0, present: 0, late: 0, absent: 0, unmarked: 0 };

  return (
    <main className="min-h-screen bg-gray-100 font-sans flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <TeacherSidebar activeSection={activeSection} onSelect={setActiveSection} />

        <section className="flex-1 p-6 md:p-8 bg-white rounded-xl border border-gray-200 shadow-md">
          <DashboardHeader user={user} />

          {activeSection === 'overview' && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/80">
                  <h2 className="text-xs font-semibold text-emerald-700 tracking-wide uppercase mb-1">Assigned classes</h2>
                  <p className="text-sm text-gray-800">
                    Quick view of classes where you manage attendance.
                  </p>
                  <p className="mt-1 text-xs text-emerald-900/70">
                    Use the Attendance section to load students and submit daily records.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/80">
                  <h2 className="text-xs font-semibold text-blue-700 tracking-wide uppercase mb-1">Today&apos;s sessions</h2>
                  <p className="text-sm text-gray-800">
                    Placeholder for today&apos;s schedule and attendance tasks.
                  </p>
                  <p className="mt-1 text-xs text-blue-900/70">
                    Future enhancement: show upcoming classes and attendance status per subject.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/80">
                  <h2 className="text-xs font-semibold text-amber-700 tracking-wide uppercase mb-1">Pending attendance</h2>
                  <p className="text-sm text-gray-800">
                    Placeholder for sections where attendance is not yet submitted.
                  </p>
                  <p className="mt-1 text-xs text-amber-900/70">
                    Use this area to quickly jump into classes that still need attention.
                  </p>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Students</h2>
                  <p className="text-sm text-gray-600">
                    Search for a student to view their attendance summary across your classes.
                  </p>
                </div>
                <form
                  onSubmit={handleSearchStudents}
                  className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
                >
                  <input
                    type="text"
                    value={studentsSearch}
                    onChange={e => setStudentsSearch(e.target.value)}
                    placeholder="Search by student name..."
                    className="w-full sm:w-60 px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={studentsLoading}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60"
                  >
                    {studentsLoading ? 'Searching...' : 'Search'}
                  </button>
                </form>
              </div>

              {studentsError && (
                <p className="text-sm text-red-600">{studentsError}</p>
              )}

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Present</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Late</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Absent</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentsSummary && studentsSummary.length > 0 ? (
                      studentsSummary.map(s => (
                        <tr key={s.studentId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{s.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{s.email}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{s.presentCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{s.lateCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{s.absentCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-900">
                            {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center text-xs text-gray-400"
                        >
                          {studentsLoading ? 'Loading students...' : 'No students found yet. Try searching by name.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Notification logs</h2>
                <p className="text-sm text-gray-600">
                  Recent notifications related to your classes and students.
                </p>
              </div>

              {notificationsLoading && (
                <p className="text-xs text-gray-500">Loading notifications...</p>
              )}

              {notificationsError && (
                <p className="text-xs text-red-600">{notificationsError}</p>
              )}

              {!notificationsLoading && !notificationsError && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  {notifications && notifications.length > 0 ? (
                    <ul className="space-y-2">
                      {notifications.map(n => (
                        <li
                          key={n.id}
                          className="border border-gray-100 rounded-md px-3 py-2 bg-gray-50"
                        >
                          <p className="text-gray-900 text-sm mb-1">{n.message}</p>
                          <p className="text-[11px] text-gray-500">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
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

          {activeSection === 'attendance' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Record attendance</h2>
                <p className="text-sm text-gray-600">
                  Select class, subject, and date, then mark each student as Present, Late, or Absent.
                </p>
              </div>

              <form
                onSubmit={handleLoadAttendanceStudents}
                className="flex flex-wrap gap-3 items-end"
              >
                <div className="min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={e => setAttendanceDate(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={attendanceLoading}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60"
                >
                  {attendanceLoading ? 'Loading...' : 'Load students'}
                </button>
              </form>

              {attendanceError && (
                <p className="text-sm text-red-600">{attendanceError}</p>
              )}
              {attendanceSuccess && (
                <p className="text-sm text-emerald-600">{attendanceSuccess}</p>
              )}

              {attendanceStudents.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2 text-gray-800">
                        <span className="font-semibold mr-2">Session summary:</span>
                        <span>Total: {sessionSummary.total}</span>
                        <span>Present: {sessionSummary.present}</span>
                        <span>Late: {sessionSummary.late}</span>
                        <span>Absent: {sessionSummary.absent}</span>
                        <span>Unmarked: {sessionSummary.unmarked}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-gray-700">
                          Session: {sessionActive ? 'In progress' : 'Not started'}
                          {sessionActive && ` · ${sessionElapsedMinutes} min`}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartSession}
                          disabled={sessionActive || !attendanceStudents.length}
                          className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium border-emerald-600 bg-emerald-600 text-white disabled:opacity-60"
                        >
                          Start session
                        </button>
                        {sessionActive && (
                          <button
                            type="button"
                            onClick={handleEndSession}
                            className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium border-gray-400 bg-white text-gray-800"
                          >
                            End session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs">
                    <input
                      type="text"
                      value={attendanceFilterName}
                      onChange={e => setAttendanceFilterName(e.target.value)}
                      placeholder="Filter by name"
                      className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={attendanceFilterDepartment}
                      onChange={e => setAttendanceFilterDepartment(e.target.value)}
                      placeholder="Department"
                      className="flex-1 min-w-[140px] rounded-md border border-gray-300 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={attendanceFilterYear}
                      onChange={e => setAttendanceFilterYear(e.target.value)}
                      placeholder="Year level"
                      className="flex-1 min-w-[120px] rounded-md border border-gray-300 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 text-xs">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 max-h-40 overflow-auto px-3 py-2">
                      <div className="font-semibold mb-1">Missing / unmarked students</div>
                      {filteredAttendanceStudents
                        .filter(s => {
                          const status = attendanceStatus[s.enrollmentId];
                          return !status || status === 'ABSENT';
                        })
                        .map(s => (
                          <div key={s.enrollmentId} className="border-b border-gray-100 py-1">
                            <div className="text-xs font-medium text-gray-900">{s.name}</div>
                            <div className="text-[11px] text-gray-600">
                              {(s.email || '') + (s.department ? ` · ${s.department}` : '') + (s.year ? ` · ${s.year}` : '')}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 md:w-40">
                      <button
                        type="button"
                        onClick={handleWarnMissing}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
                      >
                        Warn missing
                      </button>
                      <button
                        type="button"
                        onClick={handleRefreshSessionSummary}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Refresh monitor
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white text-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Year</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAttendanceStudents.map(student => (
                          <tr key={student.enrollmentId} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{student.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{student.department || '—'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{student.year || '—'}</td>
                            <td className="px-4 py-2 text-sm text-center">
                              <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1 py-0.5">
                                {['PRESENT', 'LATE', 'ABSENT'].map(option => {
                                  const isActive = attendanceStatus[student.enrollmentId] === option;
                                  const base = 'border-none rounded-full px-2 py-0.5 text-[11px] cursor-pointer';
                                  const activeClass =
                                    option === 'ABSENT'
                                      ? 'bg-red-100 text-red-800'
                                      : option === 'LATE'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800';
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => handleStatusChange(student.enrollmentId, option)}
                                      className={[
                                        base,
                                        isActive ? activeClass : 'bg-transparent text-gray-500 hover:bg-gray-200',
                                      ].join(' ')}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="mt-1">
                                <button
                                  type="button"
                                  onClick={() => recordArrival(student.enrollmentId)}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full border border-gray-300 bg-white text-[11px] text-gray-700 hover:bg-gray-50"
                                >
                                  Record arrival
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={attendanceSaving}
                    className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60"
                  >
                    {attendanceSaving ? 'Saving...' : 'Save attendance'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-gray-400">
                  No students loaded yet. Enter class ID and subject ID, then click
                  <span className="font-semibold"> Load students</span> to start recording attendance.
                </p>
              )}
            </section>
          )}

          {activeSection === 'reports' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Reports & summaries</h2>
                <p className="text-sm text-gray-600">
                  Generate summaries per subject for your assigned classes over a date range.
                </p>
              </div>

              <form
                onSubmit={handleLoadReports}
                className="flex flex-wrap gap-3 items-end"
              >
                <div className="min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={reportsSubjectId}
                    onChange={e => setReportsSubjectId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All subjects</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={reportsFrom}
                    onChange={e => setReportsFrom(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={reportsTo}
                    onChange={e => setReportsTo(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reportsLoading}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60"
                >
                  {reportsLoading ? 'Loading...' : 'Generate report'}
                </button>
              </form>

              {reportsError && (
                <p className="text-sm text-red-600">{reportsError}</p>
              )}

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white text-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Present</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Late</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Absent</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportsData && reportsData.length > 0 ? (
                      reportsData.map(row => (
                        <tr key={row.subjectId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row.code ? `${row.code} - ${row.name}` : row.name}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{row.presentCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{row.lateCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{row.absentCount}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-900">
                            {row.attendancePercentage != null ? `${row.attendancePercentage}%` : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-center text-xs text-gray-400"
                        >
                          {reportsLoading
                            ? 'Loading reports...'
                            : 'No report data yet. Select filters and click Generate report.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
