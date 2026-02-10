export default function OverviewSection({ overview }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Total Students</h2>
        <p className="text-3xl font-semibold text-gray-900">{overview?.studentCount ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">Number of students in the system</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Total Teachers</h2>
        <p className="text-3xl font-semibold text-gray-900">{overview?.teacherCount ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">Number of teachers in the system</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Program Heads</h2>
        <p className="text-3xl font-semibold text-gray-900">{overview?.programHeadCount ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">Number of program heads in the system</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Active Classes</h2>
        <p className="text-3xl font-semibold text-gray-900">{overview?.classCount ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">Number of classes configured</p>
      </div>
    </div>
  );
}
