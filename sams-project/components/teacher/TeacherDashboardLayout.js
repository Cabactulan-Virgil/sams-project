import { useState } from 'react';

export default function TeacherDashboardLayout({ user }) {
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

  const [studentsSearch, setStudentsSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [studentsSummary, setStudentsSummary] = useState([]);

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
        initialStatus[s.enrollmentId] = initialStatus[s.enrollmentId] || 'PRESENT';
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
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Class ID</label>
                  <input
                    type="text"
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    placeholder="e.g. 1"
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d4',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div style={{ minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Subject ID</label>
                  <input
                    type="text"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    placeholder="e.g. 1"
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
                  <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Student</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceStudents.map(student => (
                          <tr key={student.enrollmentId}>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.name}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{student.email}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '0.25rem', background: '#f3f4f6', borderRadius: '999px', padding: '0.15rem' }}>
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
                                        (attendanceStatus[student.enrollmentId] || 'PRESENT') === option
                                          ? option === 'ABSENT'
                                            ? '#fee2e2'
                                            : option === 'LATE'
                                            ? '#fef3c7'
                                            : '#dcfce7'
                                          : 'transparent',
                                      color:
                                        (attendanceStatus[student.enrollmentId] || 'PRESENT') === option
                                          ? '#111827'
                                          : '#6b7280',
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
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
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Generates reports and summaries per subject for your assigned classes.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Placeholder — connect this to reporting data (per subject, per date range).</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
