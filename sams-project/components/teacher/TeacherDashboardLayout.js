import { useState, useEffect } from 'react';

export default function TeacherDashboardLayout({ user, classes = [], subjects = [] }) {
  const [activeSection, setActiveSection] = useState('overview');

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

  const containerStyle = {
    minHeight: '100vh',
    padding: '2.5rem 2rem 2rem',
    background: '#e5e7eb',
    fontFamily: 'Arial',
  };

  const shellStyle = {
    maxWidth: '1200px',
    margin: '0 auto 0 0',
    display: 'flex',
    gap: '2rem',
  };

  const sidebarButton = (section, label) => (
    <button
      type="button"
      onClick={() => setActiveSection(section)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        border: 'none',
        background: activeSection === section ? '#1f2937' : 'transparent',
        color: '#e5e7eb',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

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

      const students = data.students || [];
      setAttendanceStudents(students);

      const initialStatus = {};
      students.forEach(s => {
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

  const [attendanceFilterName, setAttendanceFilterName] = useState('');
  const [attendanceFilterDepartment, setAttendanceFilterDepartment] = useState('');
  const [attendanceFilterYear, setAttendanceFilterYear] = useState('');

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
    <main style={containerStyle}>
      <div style={shellStyle}>
        <aside
          style={{
            flex: '0 0 260px',
            background: '#111827',
            color: '#f9fafb',
            padding: '1.5rem 1.25rem',
            borderRadius: '0.75rem',
            boxShadow: '0 18px 40px rgba(15,23,42,0.6)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>SAMS Teacher</h2>
          <nav>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('overview', 'Dashboard overview')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('students', 'Students')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('logs', 'Notification logs')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('attendance', 'Attendance updates')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('reports', 'Reports & summaries')}</div>
          </nav>
        </aside>
        <section
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 12px 30px rgba(15,23,42,0.18)',
          }}
        >
          <header
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Teacher Dashboard</h1>
              <p style={{ marginBottom: '0.25rem' }}>Welcome, {user.name} ({user.email}).</p>
              <p style={{ marginBottom: '0.25rem' }}>Role: {user.role}</p>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: '1px solid #dc2626',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </header>

          {activeSection === 'overview' && (
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Assigned classes</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Quick view of classes where you manage attendance.</p>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Today&apos;s sessions</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for today&apos;s schedule and attendance tasks.</p>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Pending attendance</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for sections where attendance is not yet submitted.</p>
              </div>
            </section>
          )}

          {activeSection === 'students' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Students</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Search for a student to view their attendance summary across your classes.
              </p>
              <form
                onSubmit={handleSearchStudents}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}
              >
                <input
                  type="text"
                  value={studentsSearch}
                  onChange={e => setStudentsSearch(e.target.value)}
                  placeholder="Search by student name..."
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d4d4d4',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={studentsLoading}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {studentsLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
              {studentsError && (
                <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{studentsError}</p>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Student</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Present</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Late</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Absent</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsSummary && studentsSummary.length > 0 ? (
                      studentsSummary.map(s => (
                        <tr key={s.studentId}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{s.name}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{s.email}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{s.presentCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{s.lateCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{s.absentCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                            {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
                          {studentsLoading ? 'Loading students...' : 'No students found yet. Try searching by name.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'logs' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Notification logs</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Logs in to record attendance for assigned classes.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Updates attendance records (Present, Late, Absent).
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Generates reports and summaries per subject.
              </p>
            </section>
          )}

          {activeSection === 'attendance' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Record attendance</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Select class, subject, and date, then mark each student as Present, Late, or Absent.
              </p>

              <form
                onSubmit={handleLoadAttendanceStudents}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  alignItems: 'flex-end',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Class</label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Select class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Subject</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={e => setAttendanceDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={attendanceLoading}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {attendanceLoading ? 'Loading...' : 'Load students'}
                </button>
              </form>

              {attendanceError && (
                <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{attendanceError}</p>
              )}
              {attendanceSuccess && (
                <p style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{attendanceSuccess}</p>
              )}

              {attendanceStudents.length > 0 ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <strong style={{ marginRight: '0.5rem' }}>Session summary:</strong>
                      <span style={{ marginRight: '0.5rem' }}>Total: {sessionSummary.total}</span>
                      <span style={{ marginRight: '0.5rem' }}>Present: {sessionSummary.present}</span>
                      <span style={{ marginRight: '0.5rem' }}>Late: {sessionSummary.late}</span>
                      <span style={{ marginRight: '0.5rem' }}>Absent: {sessionSummary.absent}</span>
                      <span>Unmarked: {sessionSummary.unmarked}</span>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                          Session: {sessionActive ? 'In progress' : 'Not started'}
                          {sessionActive && ` · ${sessionElapsedMinutes} min`}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartSession}
                          disabled={sessionActive || !attendanceStudents.length}
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            border: '1px solid #2563eb',
                            background: sessionActive ? '#e5e7eb' : '#2563eb',
                            color: sessionActive ? '#6b7280' : '#ffffff',
                            fontSize: '0.75rem',
                            cursor: sessionActive ? 'default' : 'pointer',
                          }}
                        >
                          Start session
                        </button>
                        {sessionActive && (
                          <button
                            type="button"
                            onClick={handleEndSession}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '999px',
                              border: '1px solid #6b7280',
                              background: '#ffffff',
                              color: '#374151',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            End session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <input
                      type="text"
                      value={attendanceFilterName}
                      onChange={e => setAttendanceFilterName(e.target.value)}
                      placeholder="Filter by name"
                      style={{
                        flex: 1,
                        minWidth: '160px',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d4d4d4',
                        fontSize: '0.8rem',
                      }}
                    />
                    <input
                      type="text"
                      value={attendanceFilterDepartment}
                      onChange={e => setAttendanceFilterDepartment(e.target.value)}
                      placeholder="Department"
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d4d4d4',
                        fontSize: '0.8rem',
                      }}
                    />
                    <input
                      type="text"
                      value={attendanceFilterYear}
                      onChange={e => setAttendanceFilterYear(e.target.value)}
                      placeholder="Year level"
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d4d4d4',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        maxHeight: '140px',
                        overflow: 'auto',
                      }}
                    >
                      <div style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Missing / unmarked students</div>
                      {filteredAttendanceStudents
                        .filter(s => {
                          const status = attendanceStatus[s.enrollmentId];
                          return !status || status === 'ABSENT';
                        })
                        .map(s => (
                          <div key={s.enrollmentId} style={{ padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {(s.email || '') + (s.department ? ` · ${s.department}` : '') + (s.year ? ` · ${s.year}` : '')}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Student</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Department</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Year</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendanceStudents.map(student => (
                          <tr key={student.enrollmentId}>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.name}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.email}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.department || '—'}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.year || '—'}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  gap: '0.25rem',
                                  background: '#f3f4f6',
                                  borderRadius: '999px',
                                  padding: '0.15rem',
                                }}
                              >
                                {['PRESENT', 'LATE', 'ABSENT'].map(option => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleStatusChange(student.enrollmentId, option)}
                                    style={{
                                      border: 'none',
                                      borderRadius: '999px',
                                      padding: '0.2rem 0.55rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      background:
                                        attendanceStatus[student.enrollmentId] === option
                                          ? option === 'ABSENT'
                                            ? '#fee2e2'
                                            : option === 'LATE'
                                            ? '#fef3c7'
                                            : '#dcfce7'
                                          : 'transparent',
                                      color:
                                        attendanceStatus[student.enrollmentId] === option ? '#111827' : '#6b7280',
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                              <div style={{ marginTop: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => recordArrival(student.enrollmentId)}
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '999px',
                                    padding: '0.2rem 0.6rem',
                                    fontSize: '0.75rem',
                                    background: '#ffffff',
                                    color: '#374151',
                                    cursor: 'pointer',
                                  }}
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
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {attendanceSaving ? 'Saving...' : 'Save attendance'}
                  </button>
                </>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  No students loaded yet. Enter class ID and subject ID, then click
                  <span style={{ fontWeight: 600 }}> Load students</span> to start recording attendance.
                </p>
              )}
            </section>
          )}

          {activeSection === 'reports' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Reports & summaries</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Generate summaries per subject for your assigned classes over a date range.
              </p>
              <form
                onSubmit={handleLoadReports}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  alignItems: 'flex-end',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ minWidth: '160px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Subject</label>
                  <select
                    value={reportsSubjectId}
                    onChange={e => setReportsSubjectId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">All subjects</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>From</label>
                  <input
                    type="date"
                    value={reportsFrom}
                    onChange={e => setReportsFrom(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div style={{ minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>To</label>
                  <input
                    type="date"
                    value={reportsTo}
                    onChange={e => setReportsTo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={reportsLoading}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {reportsLoading ? 'Loading...' : 'Generate report'}
                </button>
              </form>
              {reportsError && (
                <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{reportsError}</p>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Subject</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Present</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Late</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Absent</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData && reportsData.length > 0 ? (
                      reportsData.map(row => (
                        <tr key={row.subjectId}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            {row.code ? `${row.code} - ${row.name}` : row.name}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{row.presentCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{row.lateCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>{row.absentCount}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                            {row.attendancePercentage != null ? `${row.attendancePercentage}%` : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}
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
