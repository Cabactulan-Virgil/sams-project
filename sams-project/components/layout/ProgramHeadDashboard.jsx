import { useEffect, useMemo, useState } from 'react';
import DashboardHeader from './DashboardHeader';

function ProgramHeadSidebar({ activeSection, onSelect }) {
  const groups = [
    {
      title: 'Overview',
      items: ['overview'],
    },
    {
      title: 'People',
      items: ['users', 'students', 'teachers'],
    },
    {
      title: 'Academic structure',
      items: ['classes', 'subjects', 'enrollments'],
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
                    activeSection === sec ? 'bg-purple-600 text-white' : 'hover:bg-gray-300 text-gray-800'
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

export default function ProgramHeadDashboard({
  user,
  program,
  overview,
  students,
  teachers,
  attendance,
  classes = [],
  subjects = [],
  enrollments = [],
  teacherAttendanceActivity,
  notifications,
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [studentSearchDraft, setStudentSearchDraft] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const [userSearchDraft, setUserSearchDraft] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showAddUserChooser, setShowAddUserChooser] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  const [showNewStudentPassword, setShowNewStudentPassword] = useState(false);
  const [showNewTeacherPassword, setShowNewTeacherPassword] = useState(false);

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    studentYear: '',
  });

  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    teacherCourse: '',
    teacherLevel: '',
  });

  const [userList, setUserList] = useState([...(students || []), ...(teachers || [])]);

  const [attendanceList, setAttendanceList] = useState(attendance || []);
  const [savingAttendanceId, setSavingAttendanceId] = useState(null);

  // CRUD state for users
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    studentYear: '',
    teacherCourse: '',
    teacherLevel: '',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    setAttendanceList(attendance || []);
  }, [attendance]);

  useEffect(() => {
    setUserList([...(students || []), ...(teachers || [])]);
  }, [students, teachers]);

  const studentList = useMemo(() => {
    return (userList || []).filter(u => u.role === 'student');
  }, [userList]);

  const teacherList = useMemo(() => {
    return (userList || []).filter(u => u.role === 'teacher');
  }, [userList]);

  const teacherAnalytics = useMemo(() => {
    const base = teacherList || [];
    const byLevel = base.reduce((acc, t) => {
      const key = (t.teacherLevel || 'N/A').toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      total: base.length,
      byLevel,
    };
  }, [teacherList]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return studentList;
    const term = studentSearch.toLowerCase().trim();
    if (!term) return studentList;
    return (studentList || []).filter(s => {
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [studentList, studentSearch]);

  const studentAnalytics = useMemo(() => {
    const base = filteredStudents || [];
    const byYear = base.reduce((acc, s) => {
      const key = (s.studentYear || 'N/A').toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      total: base.length,
      byYear,
    };
  }, [filteredStudents]);

  const filteredUsers = useMemo(() => {
    const base = userList || [];
    const roleFiltered =
      userRoleFilter === 'all'
        ? base
        : base.filter(u => u.role === userRoleFilter);

    if (!userSearch) return roleFiltered;
    const term = userSearch.toLowerCase().trim();
    if (!term) return roleFiltered;

    return roleFiltered.filter(u => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [userList, userRoleFilter, userSearch]);

  const userAnalytics = useMemo(() => {
    const base = filteredUsers || [];
    const studentCount = base.filter(u => u.role === 'student').length;
    const teacherCount = base.filter(u => u.role === 'teacher').length;
    return {
      total: base.length,
      students: studentCount,
      teachers: teacherCount,
    };
  }, [filteredUsers]);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/program-head/users', { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.users) {
        alert(data.message || 'Failed to refresh users');
        return;
      }
      setUserList(data.users);
    } catch (err) {
      console.error('Program head refresh users error', err);
      alert('Failed to refresh users');
    }
  };

  const openAddStudent = () => {
    setNewStudentForm({ name: '', email: '', password: '', studentYear: '' });
    setShowNewStudentPassword(false);
    setAddingStudent(true);
  };

  const openAddTeacher = () => {
    setNewTeacherForm({ name: '', email: '', password: '', teacherCourse: '', teacherLevel: '' });
    setShowNewTeacherPassword(false);
    setAddingTeacher(true);
  };

  const closeAddStudent = () => {
    setAddingStudent(false);
    setSavingUser(false);
    setShowNewStudentPassword(false);
  };

  const closeAddTeacher = () => {
    setAddingTeacher(false);
    setSavingUser(false);
    setShowNewTeacherPassword(false);
  };

  const handleCreateStudent = async () => {
    if (!newStudentForm.name || !newStudentForm.email) {
      alert('Name and email are required');
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch('/api/program-head/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          name: newStudentForm.name,
          email: newStudentForm.email,
          password: newStudentForm.password,
          studentYear: newStudentForm.studentYear,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to create student');
        setSavingUser(false);
        return;
      }
      setUserList(prev => [data.user, ...(prev || [])]);
      setSavingUser(false);
      closeAddStudent();
    } catch (err) {
      console.error('Program head create student error', err);
      alert('Failed to create student');
      setSavingUser(false);
    }
  };

  const handleCreateTeacher = async () => {
    if (!newTeacherForm.name || !newTeacherForm.email) {
      alert('Name and email are required');
      return;
    }
    if (!newTeacherForm.teacherCourse || !newTeacherForm.teacherLevel) {
      alert('Course and level are required');
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch('/api/program-head/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          name: newTeacherForm.name,
          email: newTeacherForm.email,
          password: newTeacherForm.password,
          teacherCourse: newTeacherForm.teacherCourse,
          teacherLevel: newTeacherForm.teacherLevel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to create teacher');
        setSavingUser(false);
        return;
      }
      setUserList(prev => [data.user, ...(prev || [])]);
      setSavingUser(false);
      closeAddTeacher();
    } catch (err) {
      console.error('Program head create teacher error', err);
      alert('Failed to create teacher');
      setSavingUser(false);
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      studentYear: user.studentYear || '',
      teacherCourse: user.teacherCourse || '',
      teacherLevel: user.teacherLevel || '',
    });
    setShowEditPassword(false);
    setShowEditUserModal(true);
  };

  const closeEditUser = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
    setSavingUser(false);
    setShowEditPassword(false);
  };

  const handleUpdateUser = async () => {
    if (!editUserForm.name || !editUserForm.email) {
      alert('Name and email are required');
      return;
    }
    if (editUserForm.role === 'teacher' && (!editUserForm.teacherCourse || !editUserForm.teacherLevel)) {
      alert('Course and level are required for teachers');
      return;
    }
    setSavingUser(true);
    try {
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
      };
      if (editUserForm.password) {
        payload.password = editUserForm.password;
      }
      if (editUserForm.role === 'student') {
        payload.studentYear = editUserForm.studentYear;
      } else if (editUserForm.role === 'teacher') {
        payload.teacherCourse = editUserForm.teacherCourse;
        payload.teacherLevel = editUserForm.teacherLevel;
      }

      const res = await fetch(`/api/program-head/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to update user');
        setSavingUser(false);
        return;
      }
      setUserList(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
      setSavingUser(false);
      closeEditUser();
    } catch (err) {
      console.error('Program head update user error', err);
      alert('Failed to update user');
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/program-head/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Failed to delete user');
        return;
      }
      setUserList(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Program head delete user error', err);
      alert('Failed to delete user');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 font-sans flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <ProgramHeadSidebar activeSection={activeSection} onSelect={setActiveSection} />

        <section className="flex-1 p-6 md:p-8 bg-white rounded-xl border border-gray-200 shadow-md">
          <DashboardHeader
            user={user}
            notificationCount={Array.isArray(notifications) ? notifications.length : 0}
          />

          {activeSection === 'overview' && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Program Head</p>
                  <p className="mt-2 text-sm text-gray-900">Manages subjects, students, teachers, and class assignments.</p>
                  <p className="mt-1 text-xs text-purple-900/70">Generates overall attendance reports and system-wide analytics.</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Students</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.studentCount ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Teachers</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.teacherCount ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Program Heads</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.programHeadCount ?? '—'}</p>
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Active Classes</h2>
                  <p className="text-3xl font-semibold text-gray-900">{(classes || []).length}</p>
                  <p className="text-sm text-gray-500 mt-1">Number of classes configured</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Total Subjects</h2>
                  <p className="text-3xl font-semibold text-gray-900">{(subjects || []).length}</p>
                  <p className="text-sm text-gray-500 mt-1">Subjects available in the system</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Total Enrollments</h2>
                  <p className="text-3xl font-semibold text-gray-900">{(enrollments || []).length}</p>
                  <p className="text-sm text-gray-500 mt-1">Enrollments under your program</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Attendance records</h2>
                  <p className="text-3xl font-semibold text-gray-900">{(attendanceList || []).length}</p>
                  <p className="text-sm text-gray-500 mt-1">Recent records loaded</p>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-900">Quick summary</h2>
                <p className="mt-1 text-xs text-gray-600">
                  Manage students for your program, review recent attendance updates, and generate summaries.
                </p>
              </section>

              <section className="border border-gray-200 rounded-xl p-4 md:p-5 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Quick snapshot of your community</h3>
                    <p className="text-xs text-gray-600">Students, teachers, and classes overview in one place.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Students: {overview?.studentCount ?? '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Teachers: {overview?.teacherCount ?? '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Program Heads: {overview?.programHeadCount ?? '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      Classes: {(classes || []).length}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Use the sections in the left sidebar to drill down into each area (Students, Teachers, Classes,
                  Subjects) and manage data for your program.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'classes' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Classes</h2>
                <p className="text-sm text-gray-600">Academic structure for your program.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Section</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">School year</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Created at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(classes || []).map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 text-gray-900">{row.name || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.section || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.school_year || '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!classes || classes.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-xs text-center text-gray-400">
                          No classes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'subjects' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Subjects</h2>
                <p className="text-sm text-gray-600">Academic structure for your program.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Created at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(subjects || []).map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 text-gray-900">{row.code || '—'}</td>
                        <td className="px-4 py-2 text-gray-900">{row.name || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.description || '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!subjects || subjects.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-xs text-center text-gray-400">
                          No subjects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'enrollments' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Enrollments</h2>
                <p className="text-sm text-gray-600">Manage enrollments for your program.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Class ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Teacher ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Created at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(enrollments || []).map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 text-gray-700">{row.student_id}</td>
                        <td className="px-4 py-2 text-gray-700">{row.subject_id}</td>
                        <td className="px-4 py-2 text-gray-700">{row.class_id ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.teacher_id}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!enrollments || enrollments.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-xs text-center text-gray-400">
                          No enrollments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Logs</h2>
                <p className="text-sm text-gray-600">Program activity based on attendance records.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Enrollment</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Class</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Teacher</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Remarks</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Recorded by</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Created</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(attendanceList || []).map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{row.enrollment_id ?? '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.attendance_date ? new Date(row.attendance_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          <div className="text-xs text-gray-900">{row.studentName || '—'}</div>
                          <div className="text-[11px] text-gray-500">{row.studentEmail || ''}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{row.subjectLabel || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.className || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.teacherName || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.status}</td>
                        <td className="px-4 py-2 text-gray-700">{row.remarks || ''}</td>
                        <td className="px-4 py-2 text-gray-700">{row.recordedByName || '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!attendanceList || attendanceList.length === 0) && (
                      <tr>
                        <td colSpan={12} className="px-4 py-4 text-xs text-center text-gray-400">
                          No logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">All Users</h2>
                  <p className="text-sm text-gray-600">View students and teachers in one list.</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddUserChooser(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium shadow-sm hover:bg-purple-700"
                  >
                    Add user
                  </button>
                  <button
                    type="button"
                    onClick={refreshUsers}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Total</p>
                  <p className="mt-1 text-sm text-gray-900">{userAnalytics.total}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Students</p>
                  <p className="mt-1 text-sm text-gray-900">{userAnalytics.students}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Teachers</p>
                  <p className="mt-1 text-sm text-gray-900">{userAnalytics.teachers}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="inline-flex rounded-md border border-gray-300 bg-white overflow-hidden w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium ${
                      userRoleFilter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('student')}
                    className={`px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                      userRoleFilter === 'student' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('teacher')}
                    className={`px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                      userRoleFilter === 'teacher' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Teachers
                  </button>
                </div>

                <div className="flex flex-row gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={userSearchDraft}
                    onChange={(e) => setUserSearchDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setUserSearch(userSearchDraft.trim());
                    }}
                    placeholder="Search by name or email"
                    className="w-full md:w-72 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setUserSearch(userSearchDraft.trim())}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Email</th>
                      <th className="px-3 py-2 font-semibold">Role</th>
                      <th className="px-3 py-2 font-semibold">Details</th>
                      <th className="px-3 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map(u => {
                      const detail =
                        u.role === 'student'
                          ? `${u.studentDepartment || '—'} ${u.studentYear ? `• Year ${u.studentYear}` : ''}`.trim()
                          : `${u.teacherCourse || '—'} ${u.teacherLevel ? `• ${u.teacherLevel}` : ''}`.trim();

                      return (
                        <tr key={u.id} className="text-gray-800">
                          <td className="px-3 py-2 whitespace-nowrap">{u.name || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{u.email || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{u.role}</td>
                          <td className="px-3 py-2">{detail || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditUser(u)}
                                className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-xs text-center text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Students</h2>
                  <p className="text-sm text-gray-600">Students under program: {program || 'Unassigned'}</p>
                </div>
                <div className="flex flex-row gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={studentSearchDraft}
                    onChange={(e) => setStudentSearchDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setStudentSearch(studentSearchDraft.trim());
                    }}
                    placeholder="Search by name or email"
                    className="w-full md:w-72 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setStudentSearch(studentSearchDraft.trim())}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
                    <p className="text-xs text-gray-600">Based on current filters/search.</p>
                  </div>
                  <div className="text-sm text-gray-900">Total: {studentAnalytics.total}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(studentAnalytics.byYear).length > 0 ? (
                    Object.entries(studentAnalytics.byYear)
                      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
                      .map(([year, count]) => (
                        <span
                          key={year}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px]"
                        >
                          Year {year}: {count}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-gray-400">No data.</span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Year</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2 text-gray-900">
                          <div className="text-xs text-gray-900">{s.name}</div>
                          <div className="text-[11px] text-gray-500">{s.email}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{s.studentDepartment || 'Unassigned'}</td>
                        <td className="px-4 py-2 text-gray-700">{s.studentYear || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditUser(s)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(s.id)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-xs text-center text-gray-400">
                          No students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'teachers' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Teachers</h2>
                  <p className="text-sm text-gray-600">Teachers in program: {program || 'Unassigned'}</p>
                </div>
                <div className="flex flex-row gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={openAddTeacher}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium shadow-sm hover:bg-purple-700"
                  >
                    Add Teacher
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
                    <p className="text-xs text-gray-600">Based on current list.</p>
                  </div>
                  <div className="text-sm text-gray-900">Total: {teacherAnalytics.total}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(teacherAnalytics.byLevel).length > 0 ? (
                    Object.entries(teacherAnalytics.byLevel)
                      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
                      .map(([level, count]) => (
                        <span
                          key={level}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px]"
                        >
                          Level {level}: {count}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-gray-400">No data.</span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Teacher</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Level</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teacherList && teacherList.length > 0 ? (
                      teacherList.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-xs text-gray-500">{t.id}</td>
                          <td className="px-4 py-2 text-gray-900">
                            <div className="text-xs text-gray-900">{t.name}</div>
                            <div className="text-[11px] text-gray-500">{t.email}</div>
                          </td>
                          <td className="px-4 py-2 text-gray-700">{t.teacherCourse || 'Unassigned'}</td>
                          <td className="px-4 py-2 text-gray-700">{t.teacherLevel || 'N/A'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditUser(t)}
                                className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(t.id)}
                                className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-xs text-center text-gray-400">
                          No teachers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Notification logs</h2>
                <p className="text-sm text-gray-600">Recent activity related to your program.</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                {Array.isArray(notifications) ? (
                  notifications.length > 0 ? (
                    <ul className="space-y-2">
                      {notifications.map(n => (
                        <li key={n.id} className="text-sm">
                          <div className="text-gray-900">{n.message}</div>
                          <div className="text-[11px] text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">No notifications available.</p>
                  )
                ) : (
                  <p className="text-xs text-gray-500">
                    Notifications are not enabled in your database/schema yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Attendance updates</h2>
                <p className="text-sm text-gray-600">Review recent attendance records for your program.</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Teacher activity today</h3>
                    <p className="text-xs text-gray-600">Teachers who recorded attendance today for your program.</p>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Teacher</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Course</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Level</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-600">Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(teacherAttendanceActivity || []).map(t => (
                        <tr key={t.teacherId} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">
                            <div className="text-xs text-gray-900">{t.name || '—'}</div>
                            <div className="text-[11px] text-gray-500">{t.email || ''}</div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">{t.teacherCourse || '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{t.teacherLevel || '—'}</td>
                          <td className="px-3 py-2 text-center text-gray-900">{t.recordsCount || 0}</td>
                        </tr>
                      ))}
                      {(teacherAttendanceActivity || []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-3 text-center text-xs text-gray-400">
                            No teachers have recorded attendance today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Enrollment</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Class</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Teacher</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Remarks</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Recorded by</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Created</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Updated</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceList.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{row.enrollment_id ?? '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-700">{row.attendance_date ? new Date(row.attendance_date).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2 text-gray-900">
                          <div className="text-xs text-gray-900">{row.studentName || '—'}</div>
                          <div className="text-[11px] text-gray-500">{row.studentEmail || ''}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{row.subjectLabel || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.className || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{row.teacherName || '—'}</td>
                        <td className="px-4 py-2">
                          <select
                            value={row.status}
                            onChange={(e) => {
                              const next = e.target.value;
                              setAttendanceList(prev => prev.map(r => (r.id === row.id ? { ...r, status: next } : r)));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                          >
                            <option value="present">present</option>
                            <option value="late">late</option>
                            <option value="absent">absent</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.remarks || ''}
                            onChange={(e) => {
                              const next = e.target.value;
                              setAttendanceList(prev => prev.map(r => (r.id === row.id ? { ...r, remarks: next } : r)));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                            placeholder="Remarks"
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">{row.recordedByName || '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            disabled={savingAttendanceId === row.id}
                            onClick={async () => {
                              setSavingAttendanceId(row.id);
                              try {
                                const res = await fetch('/api/program-head/attendance', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    attendanceId: row.id,
                                    status: row.status,
                                    remarks: row.remarks,
                                  }),
                                });
                                const data = await res.json().catch(() => ({}));
                                if (!res.ok) {
                                  alert(data.message || 'Failed to update attendance');
                                  setSavingAttendanceId(null);
                                  return;
                                }
                                setSavingAttendanceId(null);
                              } catch (err) {
                                console.error('Update attendance error', err);
                                alert('Failed to update attendance');
                                setSavingAttendanceId(null);
                              }
                            }}
                            className="inline-flex items-center px-2 py-1 rounded-md border border-purple-600 text-[11px] font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
                          >
                            {savingAttendanceId === row.id ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {attendanceList.length === 0 && (
                      <tr>
                        <td colSpan={13} className="px-4 py-4 text-xs text-center text-gray-400">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Reports & summaries</h2>
                <p className="text-sm text-gray-600">Program-level attendance summaries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Present</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.attendanceCounts?.present ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Late</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.attendanceCounts?.late ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Absent</p>
                  <p className="mt-2 text-sm text-gray-900">{overview?.attendanceCounts?.absent ?? 0}</p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-600">
                This section can be expanded with date range filters and per-student/per-subject breakdown.
              </div>
            </div>
          )}

          {showAddUserChooser && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add user</h3>
                <p className="text-xs text-gray-600 mb-4">Choose what type of user you want to add.</p>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserChooser(false);
                      openAddStudent();
                    }}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-purple-600 text-white text-xs font-medium hover:bg-purple-700"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserChooser(false);
                      openAddTeacher();
                    }}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800"
                  >
                    Teacher
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddUserChooser(false)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {addingStudent && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add student</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      value={newStudentForm.name}
                      onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                    <input
                      type="email"
                      value={newStudentForm.email}
                      onChange={(e) => setNewStudentForm(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year level</label>
                    <input
                      type="text"
                      value={newStudentForm.studentYear}
                      onChange={(e) => setNewStudentForm(prev => ({ ...prev, studentYear: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password (optional)</label>
                    <div className="relative">
                      <input
                        type={showNewStudentPassword ? 'text' : 'password'}
                        value={newStudentForm.password}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank to use default password"
                        className="block w-full rounded-md border border-gray-300 pr-16 px-3 py-2 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewStudentPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        {showNewStudentPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddStudent}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateStudent}
                    disabled={savingUser}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-purple-600 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
                  >
                    {savingUser ? 'Saving...' : 'Create student'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {addingTeacher && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add teacher</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      value={newTeacherForm.name}
                      onChange={(e) => setNewTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                    <input
                      type="email"
                      value={newTeacherForm.email}
                      onChange={(e) => setNewTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                    <input
                      type="text"
                      value={newTeacherForm.teacherCourse}
                      onChange={(e) => setNewTeacherForm(prev => ({ ...prev, teacherCourse: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                    <input
                      type="text"
                      value={newTeacherForm.teacherLevel}
                      onChange={(e) => setNewTeacherForm(prev => ({ ...prev, teacherLevel: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password (optional)</label>
                    <div className="relative">
                      <input
                        type={showNewTeacherPassword ? 'text' : 'password'}
                        value={newTeacherForm.password}
                        onChange={(e) => setNewTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank to use default password"
                        className="block w-full rounded-md border border-gray-300 pr-16 px-3 py-2 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewTeacherPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        {showNewTeacherPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddTeacher}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTeacher}
                    disabled={savingUser}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-purple-600 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
                  >
                    {savingUser ? 'Saving...' : 'Create teacher'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditUserModal && editingUser && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit {editUserForm.role}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      value={editUserForm.name}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Password (optional)</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editUserForm.password}
                        onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank to keep current password"
                        className="block w-full rounded-md border border-gray-300 pr-16 px-3 py-2 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        {showEditPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  {editUserForm.role === 'student' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Year level</label>
                      <input
                        type="text"
                        value={editUserForm.studentYear}
                        onChange={(e) => setEditUserForm(prev => ({ ...prev, studentYear: e.target.value }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                  )}
                  {editUserForm.role === 'teacher' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                        <input
                          type="text"
                          value={editUserForm.teacherCourse}
                          onChange={(e) => setEditUserForm(prev => ({ ...prev, teacherCourse: e.target.value }))}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                        <input
                          type="text"
                          value={editUserForm.teacherLevel}
                          onChange={(e) => setEditUserForm(prev => ({ ...prev, teacherLevel: e.target.value }))}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditUser}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateUser}
                    disabled={savingUser}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-purple-600 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
                  >
                    {savingUser ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
