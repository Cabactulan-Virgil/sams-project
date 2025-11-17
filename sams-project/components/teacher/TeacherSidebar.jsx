export default function TeacherSidebar({ activeSection, onSelect }) {
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'logs', label: 'Notification logs' },
    { id: 'attendance', label: 'Attendance updates' },
    { id: 'reports', label: 'Reports & summaries' },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex-shrink-0">
      <nav className="space-y-1">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelect(sec.id)}
              className={[
                'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              {sec.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
