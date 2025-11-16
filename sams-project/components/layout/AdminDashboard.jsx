import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';
import { useState } from 'react';

export default function AdminDashboard({ user, overview, users = [], classes = [], subjects = [] }) {
  const [activeSection, setActiveSection] = useState('overview');

  const studentUsers = users.filter(u => u.role === 'student');
  const teacherUsers = users.filter(u => u.role === 'teacher');

  return (
    <main className="min-h-screen p-8 bg-gray-100 font-sans">
      <div className="max-w-[1200px] mx-auto flex gap-8">
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <section className="flex-1 p-8 bg-white rounded-xl border border-gray-200 shadow-md">
          <DashboardHeader user={user} />

          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">
                <h2>Total Students</h2>
                <p>{overview?.studentCount ?? '—'}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2>Total Teachers</h2>
                <p>{overview?.teacherCount ?? '—'}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2>Active Classes</h2>
                <p>{overview?.classCount ?? '—'}</p>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div>
              <h2>Students List</h2>
              <ul>{studentUsers.map(s => <li key={s.id}>{s.name}</li>)}</ul>
            </div>
          )}

          {activeSection === 'teachers' && (
            <div>
              <h2>Teachers List</h2>
              <ul>{teacherUsers.map(t => <li key={t.id}>{t.name}</li>)}</ul>
            </div>
          )}

          {activeSection === 'classes' && (
            <div>
              <h2>Classes/Sections</h2>
              <ul>{classes.map(c => <li key={c.id}>{c.name}</li>)}</ul>
            </div>
          )}

          {activeSection === 'subjects' && (
            <div>
              <h2>Subjects</h2>
              <ul>{subjects.map(s => <li key={s.id}>{s.name}</li>)}</ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
