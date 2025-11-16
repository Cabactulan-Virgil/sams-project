import Card from '../ui/Card';

export default function OverviewSection({ overview }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Total Students">
        <p className="text-3xl font-semibold">{overview?.studentCount ?? '—'}</p>
        <p className="text-sm text-gray-500">Number of students in the system</p>
      </Card>
      <Card title="Total Teachers">
        <p className="text-3xl font-semibold">{overview?.teacherCount ?? '—'}</p>
        <p className="text-sm text-gray-500">Number of teachers in the system</p>
      </Card>
      <Card title="Active Classes">
        <p className="text-3xl font-semibold">{overview?.classCount ?? '—'}</p>
        <p className="text-sm text-gray-500">Number of classes configured</p>
      </Card>
    </div>
  );
}
