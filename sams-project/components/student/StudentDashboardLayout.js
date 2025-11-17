import { useState } from 'react';

export default function StudentDashboardLayout({ user, summary }) {
  const [activeSection, setActiveSection] = useState('overview');

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
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>SAMS Student</h2>
          <nav>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('overview', 'Dashboard overview')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('subjects', 'Subjects')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('attendance', 'Attendance summary')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('notifications', 'Notifications')}</div>
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
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Student Dashboard</h1>
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
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Overall attendance</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Total sessions recorded: {summary?.totalSessions ?? 0}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Attendance rate:{' '}
                  {summary?.attendancePercentage != null ? `${summary.attendancePercentage}%` : '—'}
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Recent notifications</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for latest messages from teachers or admins.</p>
              </div>
            </section>
          )}

          {activeSection === 'subjects' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Subjects</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Filter your subjects to monitor attendance per subject.
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Search subject..."
                  style={{
                    width: '100%',
                    maxWidth: '260px',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d4d4d4',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Placeholder — list of enrolled subjects will appear here with per-subject attendance summaries.
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
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Attendance</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Here is your overall attendance summary across your enrolled classes.
              </p>
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
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{user.name}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{user.email}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {summary?.presentCount ?? 0}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {summary?.lateCount ?? 0}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {summary?.absentCount ?? 0}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {summary?.attendancePercentage != null ? `${summary.attendancePercentage}%` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                Summary is based on all recorded attendance entries for your enrolled classes.
              </p>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Notifications</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Notifications from your teachers about your attendance or performance will appear here.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Placeholder — hook this to notification data sent by teachers and admins.
              </p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
