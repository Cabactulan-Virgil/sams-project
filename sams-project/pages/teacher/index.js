import Link from 'next/link';
import { getUserFromRequest } from '../../lib/auth';

export default function TeacherDashboard({ user }) {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'Arial', background: '#e5e7eb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section
          style={{
            padding: '1.75rem 2rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            boxShadow: '0 12px 30px rgba(15,23,42,0.18)',
          }}
        >
          <header style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Teacher Dashboard</h1>
            <p style={{ marginBottom: '0.25rem' }}>Welcome, {user.name} ({user.email}).</p>
            <p style={{ marginBottom: '0.25rem' }}>Role: {user.role}</p>
          </header>
          <nav style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/admin" style={{ color: '#2563eb' }}>Admin dashboard</Link>
            <Link href="/student" style={{ color: '#2563eb' }}>Student dashboard</Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #dc2626', background: '#dc2626', color: '#ffffff', cursor: 'pointer' }}
            >
              Logout
            </button>
          </nav>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Subjects management</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Placeholder area to create, edit, and assign subjects.</p>
            </div>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Students management</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Placeholder area to manage student lists and enrollment.</p>
            </div>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Teachers management</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Placeholder area to collaborate with other teachers.</p>
            </div>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Class assignments</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Placeholder area to manage class sections and assigned subjects.</p>
            </div>
          </section>
          <section style={{ maxWidth: '640px', background: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Overall attendance reports</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              This section will show overall attendance reports by class, subject, and date range.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Placeholder — connect this to real attendance data later.</p>
          </section>
        </section>
      </div>
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (user.role !== 'teacher') {
    let destination = '/student';
    if (user.role === 'admin') destination = '/admin';

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
}
