export default function DashboardHeader({ user }) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div>
        <span className="mr-4">Hello, {user?.name}</span>
        <a href="/api/logout" className="text-red-500 hover:underline">Logout</a>
      </div>
    </header>
  );
}
