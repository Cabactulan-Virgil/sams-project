import { useState } from 'react';
import { useRouter } from 'next/router';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
      } else {
        router.push(data.redirectTo || '/');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
      <div style={{ background: '#ffffff', padding: '2.5rem 2.25rem', borderRadius: '0.75rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(15,23,42,0.35)' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.6rem', textAlign: 'center' }}>Create account</h1>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
          Create your SAMS account to manage attendance and classes.
        </p>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
          Welcome to the attendance system where teachers can record and monitor student attendance efficiently.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d4d4d4' }}
            />
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d4d4d4' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Create a secure password"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d4d4d4' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d4d4d4' }}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {error && (
            <p style={{ color: '#b91c1c', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Registering...' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>Login</a>
        </p>
      </div>
    </main>
  );
}
