export default function TeacherSidebar({ activeSection, onSelect }) {
  const groups = [
    {
      title: 'Overview',
      items: [{ id: 'overview', label: 'Overview' }],
    },
    {
      title: 'People',
      items: [{ id: 'students', label: 'Students' }],
    },
    {
      title: 'Attendance & reports',
      items: [
        { id: 'attendance', label: 'Attendance' },
        { id: 'reports', label: 'Reports' },
      ],
    },
    {
      title: 'Notifications',
      items: [{ id: 'logs', label: 'Notifications' }],
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-gray-200 p-4 rounded-lg flex-shrink-0">
      <nav className="space-y-4">
        {groups.map(group => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map(sec => (
                <li
                  key={sec.id}
                  onClick={() => onSelect(sec.id)}
                  className={`cursor-pointer px-3 py-2 rounded text-sm ${
                    activeSection === sec.id
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {sec.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
