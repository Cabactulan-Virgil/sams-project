import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6 || password === '123456' || password.toLowerCase() === 'password') {
      setError('Please use a stronger password (at least 6 characters).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
        <div style={{ background: '#ffffff', padding: '2.5rem 2.25rem', borderRadius: '0.75rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(15,23,42,0.35)' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.6rem', textAlign: 'center' }}>SAMS Login</h1>
          <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
            Sign in to your account to manage attendance and classes.
          </p>
          <form onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d4d4d4' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.75rem',
                  lineHeight: 1,
                  color: '#2563eb',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
          No account yet?{' '}
          <a href="/register" style={{ color: '#2563eb', textDecoration: 'underline' }}>Register</a>
        </p>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#e5e7eb', textAlign: 'center', maxWidth: '480px' }}>
          Welcome to the attendance system where teachers can record and monitor student attendance efficiently.
        </p>
      </div>
    </main>
  );
}
