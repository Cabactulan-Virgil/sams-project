export default function Sidebar({ activeSection, onSelect }) {
  const groups = [
    {
      title: 'Overview',
      items: ['overview'],
    },
    {
      title: 'People',
      items: ['users', 'students', 'teachers', 'program_heads'],
    },
    {
      title: 'Attendance & reports',
      items: ['attendance', 'reports'],
    },
    {
      title: 'Notifications',
      items: ['logs', 'notifications'],
    },
  ];

  return (
    <aside className="w-64 bg-gray-200 p-4 rounded-lg">
      <nav className="space-y-4">
        {groups.map(group => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map(sec => (
                <li
                  key={sec}
                  onClick={() => onSelect(sec)}
                  className={`cursor-pointer px-3 py-2 rounded text-sm ${
                    activeSection === sec
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {sec
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
