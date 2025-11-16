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
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Attendance updates</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                This section will list recent attendance changes submitted by you.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Placeholder — hook this to real attendance logs later.</p>
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
