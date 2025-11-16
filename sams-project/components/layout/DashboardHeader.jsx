export default function DashboardHeader({ user }) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors, still try to navigate away
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold">
          {user?.role === 'admin' ? 'Administrator Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-gray-800">
          Welcome, {user?.name} ({user?.email}).
        </p>
        <p className="text-xs text-gray-500">Role: {user?.role}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="self-start sm:self-auto inline-flex items-center px-3 py-1.5 rounded-full border border-red-500 text-xs font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </header>
  );
}
