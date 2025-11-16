import Link from 'next/link';
import { getUserFromRequest } from '../../lib/auth';

export default function AdminDashboard({ user }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
      <p style={{ marginBottom: '1rem' }}>Welcome, {user.name} ({user.email}).</p>
      <p style={{ marginBottom: '1rem' }}>Role: {user.role}</p>
      <nav style={{ marginTop: '1rem' }}>
        <Link href="/teacher" style={{ marginRight: '1rem', color: '#2563eb' }}>Teacher dashboard</Link>
        <Link href="/student" style={{ marginRight: '1rem', color: '#2563eb' }}>Student dashboard</Link>
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

  if (user.role !== 'admin') {
    let destination = '/student';
    if (user.role === 'teacher') destination = '/teacher';

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
