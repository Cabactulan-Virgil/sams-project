export default function Sidebar({ activeSection, onSelect }) {
  const sections = ['overview', 'students', 'teachers', 'classes', 'subjects', 'enrollments', 'attendance', 'reports', 'notifications'];

  return (
    <aside className="w-64 bg-gray-200 p-4 rounded-lg">
      <ul className="space-y-2">
        {sections.map((sec) => (
          <li
            key={sec}
            onClick={() => onSelect(sec)}
            className={`cursor-pointer p-2 rounded ${
              activeSection === sec ? 'bg-blue-500 text-white' : 'hover:bg-gray-300'
            }`}
          >
            {sec.charAt(0).toUpperCase() + sec.slice(1)}
          </li>
        ))}
      </ul>
    </aside>
  );
}
