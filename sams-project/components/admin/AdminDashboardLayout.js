import { useState } from 'react';

export default function AdminDashboardLayout({ user }) {
  const [activeSection, setActiveSection] = useState('overview');

  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
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
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>SAMS Admin</h2>
          <nav>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('overview', 'Dashboard overview')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('notifications', 'Notifications')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('management', 'Management')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('attendance', 'Attendance reports')}</div>
            <div style={{ marginBottom: '0.75rem' }}>{sidebarButton('users', 'System users')}</div>
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
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
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
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Total students</h2>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>—</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for student count</p>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Total teachers</h2>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>—</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for teacher count</p>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Active classes</h2>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>—</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Placeholder for class count</p>
              </div>
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
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Notifications</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                This section will show notifications and requests submitted by teachers (e.g., leave requests, schedule changes, or attendance issues).
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#374151' }}>
                <li style={{ marginBottom: '0.25rem' }}>Placeholder notification 1</li>
                <li style={{ marginBottom: '0.25rem' }}>Placeholder notification 2</li>
                <li>Placeholder notification 3</li>
              </ul>
            </section>
          )}

          {activeSection === 'management' && (
            <section>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Management</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Admin manages subjects, students, teachers, and class assignments.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Subjects</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Placeholder to create and maintain subject records.</p>
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Students</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Placeholder to manage student enrollment and profiles.</p>
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Teachers</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Placeholder to manage teacher accounts and assignments.</p>
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Class assignments</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Placeholder to assign subjects and teachers to class sections.</p>
                </div>
              </div>
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
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Overall attendance reports</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                This area will generate overall attendance reports across subjects, classes, and date ranges.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Placeholder — connect to real attendance data and filters later.</p>
            </section>
          )}

          {activeSection === 'users' && (
            <section
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>System users</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Admin can view all users of the system here.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>Admin User</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>admin@example.com</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>admin</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>Teacher User</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>teacher@example.com</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>teacher</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Student User</td>
                      <td style={{ padding: '0.5rem' }}>student@example.com</td>
                      <td style={{ padding: '0.5rem' }}>student</td>
                    </tr>
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
