export default function DashboardHeader({ user, notificationCount }) {
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
          Welcome, {user?.name || (user?.role === 'admin' ? 'Administrator' : 'User')}.
        </p>
        {user?.role && (
          <p className="text-xs text-gray-500">Role: {user.role}</p>
        )}
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {user?.role === 'admin' && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-xs text-gray-700">
            <span className="mr-1">🔔</span>
            <span className="font-medium">Notifications</span>
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-2 py-0.5">
              {notificationCount ?? 0}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center px-3 py-1.5 rounded-full border border-red-500 text-xs font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
