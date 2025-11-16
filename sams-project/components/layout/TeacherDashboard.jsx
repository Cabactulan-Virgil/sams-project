import DashboardHeader from './DashboardHeader';

export default function TeacherDashboard({ user, classes = [] }) {
  return (
    <main className="min-h-screen p-8 bg-gray-100 font-sans">
      <DashboardHeader user={user} />
      <h2>Your Classes</h2>
      <ul>{classes.map(c => <li key={c.id}>{c.name}</li>)}</ul>
    </main>
  );
}
