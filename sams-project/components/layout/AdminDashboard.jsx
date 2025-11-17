import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import OverviewSection from '../section/OverviewSection';
import { useState, useEffect } from 'react';

export default function AdminDashboard({
  user,
  overview,
  users = [],
  classes = [],
  subjects = [],
  subjectStudentCounts = {},
  subjectFilterTags = {},
  enrollments = [],
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSearchDraft, setStudentSearchDraft] = useState('');
  const [teacherYearFilter, setTeacherYearFilter] = useState('');
  const [teacherDepartmentFilter, setTeacherDepartmentFilter] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectSearchDraft, setSubjectSearchDraft] = useState('');

  const [userList, setUserList] = useState(users);
  const [classList, setClassList] = useState(classes);
  const [subjectList, setSubjectList] = useState(subjects);
  const [enrollmentList, setEnrollmentList] = useState(enrollments);
  const [enrollmentStudentFilter, setEnrollmentStudentFilter] = useState('');

  useEffect(() => {
    setUserList(users);
  }, [users]);

  useEffect(() => {
    setClassList(classes);
  }, [classes]);

  useEffect(() => {
    setSubjectList(subjects);
  }, [subjects]);

  useEffect(() => {
    setEnrollmentList(enrollments);
  }, [enrollments]);

  const studentUsers = userList.filter(u => u.role === 'student');
  const teacherUsers = userList.filter(u => u.role === 'teacher');

  const filteredStudentUsers = studentUsers.filter(s => {
    if (!studentSearch) return true;
    const terms = studentSearch
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (terms.length === 0) return true;

    return terms.every(term =>
      String(s.id).includes(term) ||
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.studentDepartment && s.studentDepartment.toLowerCase().includes(term)) ||
      (s.studentYear && s.studentYear.toLowerCase().includes(term))
    );
  });

  const filteredTeacherUsers = teacherUsers.filter(t => {
    // filter by selected department (course)
    if (teacherDepartmentFilter) {
      const course = (t.teacherCourse || '').toLowerCase();
      if (!course.includes(teacherDepartmentFilter.toLowerCase())) {
        return false;
      }
    }

    // filter by selected year level
    if (teacherYearFilter) {
      const level = (t.teacherLevel || '').toLowerCase();
      if (!level.includes(teacherYearFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Map used for teacher cards: group by teacher name, listing year levels they teach
  const teacherNameLevelMap = filteredTeacherUsers.reduce((acc, t) => {
    const name = t.name || 'Unnamed teacher';
    const level = t.teacherLevel || 'N/A';
    if (!acc[name]) {
      acc[name] = { teacher: t, levels: new Set() };
    }
    if (level) {
      acc[name].levels.add(level);
    }
    return acc;
  }, {});

  const filteredSubjects = subjectList.filter(s => {
    if (!subjectSearch) return true;
    const terms = subjectSearch
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (terms.length === 0) return true;

    const tagInfo = subjectFilterTags && subjectFilterTags[s.id];
    const tagDepartments = tagInfo?.departments || [];
    const tagYears = tagInfo?.years || [];

    return terms.every(term =>
      String(s.id).includes(term) ||
      (s.code && s.code.toLowerCase().includes(term)) ||
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.description && s.description.toLowerCase().includes(term)) ||
      tagDepartments.some(d => d && d.toLowerCase().includes(term)) ||
      tagYears.some(y => y && String(y).toLowerCase().includes(term))
    );
  });

  const filteredEnrollmentStudents = studentUsers.filter(s => {
    if (!enrollmentStudentFilter) return true;
    const term = enrollmentStudentFilter.toLowerCase();
    const dept = (s.studentDepartment || '').toLowerCase();
    const year = s.studentYear ? String(s.studentYear).toLowerCase() : '';

    return (
      dept.includes(term) ||
      `${dept} ${year}`.trim().includes(term)
    );
  });

  const filteredEnrollmentTeachers = teacherUsers.filter(t => {
    if (!enrollmentStudentFilter) return true;
    const term = enrollmentStudentFilter.toLowerCase();
    const course = (t.teacherCourse || '').toLowerCase();
    const level = t.teacherLevel ? String(t.teacherLevel).toLowerCase() : '';

    return (
      course.includes(term) ||
      `${course} ${level}`.trim().includes(term)
    );
  });

  const filteredEnrollmentSubjects = subjectList.filter(s => {
    if (!enrollmentStudentFilter) return true;
    if (!subjectFilterTags || !subjectFilterTags[s.id]) return true;

    const tags = subjectFilterTags[s.id];
    const departments = (tags.departments || [])
      .map(d => (d ? String(d).toLowerCase() : ''))
      .filter(Boolean);
    const years = (tags.years || [])
      .map(y => (y !== undefined && y !== null ? String(y).toLowerCase() : ''))
      .filter(Boolean);

    const parts = enrollmentStudentFilter
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const deptTerm = parts[0] || '';
    const yearTerm = parts[1] || '';

    if (deptTerm && !departments.some(d => d.includes(deptTerm))) return false;
    if (yearTerm && !years.some(y => y.includes(yearTerm))) return false;

    return true;
  });

  const filteredEnrollmentList = enrollmentList.filter(e => {
    if (!enrollmentStudentFilter) return true;
    const term = enrollmentStudentFilter.toLowerCase();
    const dept = (e.student?.studentDepartment || '').toLowerCase();
    const year = e.student?.studentYear ? String(e.student.studentYear).toLowerCase() : '';

    return (
      dept.includes(term) ||
      `${dept} ${year}`.trim().includes(term)
    );
  });

  const studentDepartmentYearMap = studentUsers.reduce((acc, s) => {
    const dept = s.studentDepartment || 'Unassigned';
    const year = s.studentYear || 'N/A';
    if (!acc[dept]) {
      acc[dept] = { total: 0, years: {} };
    }
    acc[dept].total += 1;
    acc[dept].years[year] = (acc[dept].years[year] || 0) + 1;
    return acc;
  }, {});

  const enrollmentDepartmentYearMap = enrollmentList.reduce((acc, e) => {
    const dept = e.student?.studentDepartment || 'Unassigned';
    const year = e.student?.studentYear || 'N/A';
    if (!acc[dept]) {
      acc[dept] = { total: 0, years: {} };
    }
    acc[dept].total += 1;
    acc[dept].years[year] = (acc[dept].years[year] || 0) + 1;
    return acc;
  }, {});

  const teacherCourseLevelMap = filteredTeacherUsers.reduce((acc, t) => {
    const course = t.teacherCourse || 'Unassigned';
    const level = t.teacherLevel || 'N/A';
    if (!acc[course]) {
      acc[course] = { total: 0, levels: {} };
    }
    acc[course].total += 1;
    acc[course].levels[level] = (acc[course].levels[level] || 0) + 1;
    return acc;
  }, {});

  const subjectDepartmentYearMap =
    subjectStudentCounts && Object.keys(subjectStudentCounts).length > 0
      ? subjectStudentCounts
      : studentDepartmentYearMap;

  const [editingStudent, setEditingStudent] = useState(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    studentDepartment: '',
    studentYear: '',
  });
  const [studentSaving, setStudentSaving] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    studentDepartment: '',
    studentYear: '',
  });

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    teacherCourse: '',
    teacherLevel: '',
  });
  const [teacherSaving, setTeacherSaving] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    email: '',
    teacherCourse: '',
    teacherLevel: '',
  });

  const [editingClass, setEditingClass] = useState(null);
  const [addingClass, setAddingClass] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    description: '',
  });
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    description: '',
  });
  const [classSaving, setClassSaving] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    description: '',
  });
  const [newSubjectForm, setNewSubjectForm] = useState({
    code: '',
    name: '',
    description: '',
  });
  const [subjectSaving, setSubjectSaving] = useState(false);

  const [addingEnrollment, setAddingEnrollment] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    teacherId: '',
    subjectId: '',
    classId: '',
  });
  const [enrollmentSaving, setEnrollmentSaving] = useState(false);

  useEffect(() => {
    if (studentSearch && filteredStudentUsers.length === 0 && studentUsers.length > 0) {
      setStudentSearch('');
      setStudentSearchDraft('');
    }
  }, [studentSearch, filteredStudentUsers.length, studentUsers.length]);

  useEffect(() => {
    if (subjectSearch && filteredSubjects.length === 0 && subjectList.length > 0) {
      setSubjectSearch('');
      setSubjectSearchDraft('');
    }
  }, [subjectSearch, filteredSubjects.length, subjectList.length]);

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      studentDepartment: student.studentDepartment || '',
      studentYear: student.studentYear || '',
    });
  };

  const openAddEnrollment = () => {
    setEnrollmentForm({ studentId: '', teacherId: '', subjectId: '', classId: '' });
    setAddingEnrollment(true);
  };

  const closeAddEnrollment = () => {
    setAddingEnrollment(false);
    setEnrollmentSaving(false);
  };

  const handleEnrollmentFormChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEnrollment = async () => {
    const { studentId, teacherId, subjectId, classId } = enrollmentForm;
    if (!studentId || !teacherId || !subjectId || !classId) {
      alert('Please select student, teacher, subject, and class.');
      return;
    }

    setEnrollmentSaving(true);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: Number(studentId),
          teacherId: Number(teacherId),
          subjectId: Number(subjectId),
          classId: Number(classId),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.enrollment) {
        alert(data.message || 'Failed to create enrollment');
        setEnrollmentSaving(false);
        return;
      }

      setEnrollmentList(prev => [...prev, data.enrollment]);
      alert('Enrollment created successfully');
      setEnrollmentSaving(false);
      closeAddEnrollment();
    } catch (error) {
      console.error('Create enrollment error', error);
      alert('Failed to create enrollment');
      setEnrollmentSaving(false);
    }
  };

  const closeEditStudent = () => {
    setEditingStudent(null);
    setStudentForm({ name: '', email: '', studentDepartment: '', studentYear: '' });
    setStudentSaving(false);
  };

  const openAddStudent = () => {
    setNewStudentForm({ name: '', email: '', studentDepartment: '', studentYear: '' });
    setAddingStudent(true);
  };

  const closeAddStudent = () => {
    setAddingStudent(false);
    setNewStudentForm({ name: '', email: '', studentDepartment: '', studentYear: '' });
    setStudentSaving(false);
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNewStudentFormChange = (e) => {
    const { name, value } = e.target;
    setNewStudentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;
    setStudentSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentForm.name,
          email: studentForm.email,
          role: 'student',
          studentDepartment: studentForm.studentDepartment,
          studentYear: studentForm.studentYear,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to update student');
        setStudentSaving(false);
        return;
      }

      setUserList(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
      alert('Student updated successfully');
      setStudentSaving(false);
      closeEditStudent();
    } catch (error) {
      console.error('Save student error', error);
      alert('Failed to update student');
      setStudentSaving(false);
    }
  };

  const handleCreateStudent = async () => {
    setStudentSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentForm.name,
          email: newStudentForm.email,
          role: 'student',
          studentDepartment: newStudentForm.studentDepartment,
          studentYear: newStudentForm.studentYear,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to create student');
        setStudentSaving(false);
        return;
      }

      setUserList(prev => [...prev, data.user]);
      alert('Student created successfully');
      setStudentSaving(false);
      closeAddStudent();
    } catch (error) {
      console.error('Create student error', error);
      alert('Failed to create student');
      setStudentSaving(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!student) return;
    if (typeof window !== 'undefined') {
      // window.confirm is safe to call only in the browser
      if (!window.confirm(`Delete student ${student.name} (${student.email})?`)) return;
    }

    try {
      const res = await fetch(`/api/admin/users/${student.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete student');
        return;
      }
      setUserList(prev => prev.filter(u => u.id !== student.id));
      alert('Student deleted successfully');
    } catch (error) {
      console.error('Delete student error', error);
      alert('Failed to delete student');
    }
  };

  const openEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherForm({
      name: teacher.name || '',
      email: teacher.email || '',
      teacherCourse: teacher.teacherCourse || '',
      teacherLevel: teacher.teacherLevel || '',
    });
  };

  const closeEditTeacher = () => {
    setEditingTeacher(null);
    setTeacherForm({ name: '', email: '', teacherCourse: '', teacherLevel: '' });
    setTeacherSaving(false);
  };

  const openAddTeacher = () => {
    setNewTeacherForm({ name: '', email: '', teacherCourse: '', teacherLevel: '' });
    setAddingTeacher(true);
  };

  const closeAddTeacher = () => {
    setAddingTeacher(false);
    setNewTeacherForm({ name: '', email: '', teacherCourse: '', teacherLevel: '' });
    setTeacherSaving(false);
  };

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setNewTeacherForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTeacher = async () => {
    if (!editingTeacher) return;
    setTeacherSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teacherForm.name,
          email: teacherForm.email,
          role: 'teacher',
          teacherCourse: teacherForm.teacherCourse,
          teacherLevel: teacherForm.teacherLevel,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to update teacher');
        setTeacherSaving(false);
        return;
      }

      setUserList(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
      alert('Teacher updated successfully');
      setTeacherSaving(false);
      closeEditTeacher();
    } catch (error) {
      console.error('Save teacher error', error);
      alert('Failed to update teacher');
      setTeacherSaving(false);
    }
  };

  const handleCreateTeacher = async () => {
    setTeacherSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherForm.name,
          email: newTeacherForm.email,
          role: 'teacher',
          teacherCourse: newTeacherForm.teacherCourse,
          teacherLevel: newTeacherForm.teacherLevel,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        alert(data.message || 'Failed to create teacher');
        setTeacherSaving(false);
        return;
      }

      setUserList(prev => [...prev, data.user]);
      alert('Teacher created successfully');
      setTeacherSaving(false);
      closeAddTeacher();
    } catch (error) {
      console.error('Create teacher error', error);
      alert('Failed to create teacher');
      setTeacherSaving(false);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!teacher) return;
    if (typeof window !== 'undefined') {
      if (!window.confirm(`Delete teacher ${teacher.name} (${teacher.email})?`)) return;
    }

    try {
      const res = await fetch(`/api/admin/users/${teacher.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete teacher');
        return;
      }
      setUserList(prev => prev.filter(u => u.id !== teacher.id));
      alert('Teacher deleted successfully');
    } catch (error) {
      console.error('Delete teacher error', error);
      alert('Failed to delete teacher');
    }
  };

  const openEditClass = (classSection) => {
    setEditingClass(classSection);
    setClassForm({
      name: classSection.name || '',
      description: classSection.description || '',
    });
  };

  const closeEditClass = () => {
    setEditingClass(null);
    setClassForm({ name: '', description: '' });
    setClassSaving(false);
  };

  const openAddClass = () => {
    setNewClassForm({ name: '', description: '' });
    setAddingClass(true);
  };

  const closeAddClass = () => {
    setAddingClass(false);
    setNewClassForm({ name: '', description: '' });
    setClassSaving(false);
  };

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNewClassFormChange = (e) => {
    const { name, value } = e.target;
    setNewClassForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClass = async () => {
    if (!editingClass) return;
    setClassSaving(true);
    try {
      const res = await fetch(`/api/admin/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: classForm.name,
          description: classForm.description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.classSection) {
        alert(data.message || 'Failed to update class');
        setClassSaving(false);
        return;
      }

      setClassList(prev => prev.map(c => (c.id === data.classSection.id ? data.classSection : c)));
      alert('Class updated successfully');
      setClassSaving(false);
      closeEditClass();
    } catch (error) {
      console.error('Save class error', error);
      alert('Failed to update class');
      setClassSaving(false);
    }
  };

  const handleCreateClass = async () => {
    setClassSaving(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassForm.name,
          description: newClassForm.description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.classSection) {
        alert(data.message || 'Failed to create class');
        setClassSaving(false);
        return;
      }

      setClassList(prev => [...prev, data.classSection]);
      alert('Class created successfully');
      setClassSaving(false);
      closeAddClass();
    } catch (error) {
      console.error('Create class error', error);
      alert('Failed to create class');
      setClassSaving(false);
    }
  };

  const handleDeleteClass = async (classSection) => {
    if (!classSection) return;
    if (typeof window !== 'undefined') {
      if (!window.confirm(`Delete class ${classSection.name}?`)) return;
    }

    try {
      const res = await fetch(`/api/admin/classes/${classSection.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete class');
        return;
      }
      setClassList(prev => prev.filter(c => c.id !== classSection.id));
      alert('Class deleted successfully');
    } catch (error) {
      console.error('Delete class error', error);
      alert('Failed to delete class');
    }
  };

  const openEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      code: subject.code || '',
      name: subject.name || '',
      description: subject.description || '',
    });
  };

  const closeEditSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ code: '', name: '', description: '' });
    setSubjectSaving(false);
  };

  const openAddSubject = () => {
    setNewSubjectForm({ code: '', name: '', description: '' });
    setAddingSubject(true);
  };

  const closeAddSubject = () => {
    setAddingSubject(false);
    setNewSubjectForm({ code: '', name: '', description: '' });
    setSubjectSaving(false);
  };

  const handleSubjectFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNewSubjectFormChange = (e) => {
    const { name, value } = e.target;
    setNewSubjectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSubject = async () => {
    if (!editingSubject) return;
    setSubjectSaving(true);
    try {
      const res = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: subjectForm.code,
          name: subjectForm.name,
          description: subjectForm.description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.subject) {
        alert(data.message || 'Failed to update subject');
        setSubjectSaving(false);
        return;
      }

      setSubjectList(prev => prev.map(s => (s.id === data.subject.id ? data.subject : s)));
      alert('Subject updated successfully');
      setSubjectSaving(false);
      closeEditSubject();
    } catch (error) {
      console.error('Save subject error', error);
      alert('Failed to update subject');
      setSubjectSaving(false);
    }
  };

  const handleCreateSubject = async () => {
    setSubjectSaving(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newSubjectForm.code,
          name: newSubjectForm.name,
          description: newSubjectForm.description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.subject) {
        alert(data.message || 'Failed to create subject');
        setSubjectSaving(false);
        return;
      }

      setSubjectList(prev => [...prev, data.subject]);
      alert('Subject created successfully');
      setSubjectSaving(false);
      closeAddSubject();
    } catch (error) {
      console.error('Create subject error', error);
      alert('Failed to create subject');
      setSubjectSaving(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!subject) return;
    if (typeof window !== 'undefined') {
      if (!window.confirm(`Delete subject ${subject.code} - ${subject.name}?`)) return;
    }

    try {
      const res = await fetch(`/api/admin/subjects/${subject.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete subject');
        return;
      }
      setSubjectList(prev => prev.filter(s => s.id !== subject.id));
      alert('Subject deleted successfully');
    } catch (error) {
      console.error('Delete subject error', error);
      alert('Failed to delete subject');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 font-sans flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <section className="flex-1 p-6 md:p-8 bg-white rounded-xl border border-gray-200 shadow-md">
          <DashboardHeader user={user} />

          {activeSection === 'overview' && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/80">
                  <h2 className="text-xs font-semibold text-blue-700 tracking-wide uppercase mb-1">Administrator</h2>
                  <p className="text-sm text-gray-800">
                    Manages subjects, students, teachers, and class assignments.
                  </p>
                  <p className="mt-1 text-xs text-blue-900/70">
                    Generates overall attendance reports and system-wide analytics.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
                  <h2 className="text-xs font-semibold text-emerald-700 tracking-wide uppercase mb-1">Teacher</h2>
                  <p className="text-sm text-gray-800">
                    Logs in to record attendance for assigned classes.
                  </p>
                  <p className="mt-1 text-xs text-emerald-900/70">
                    Updates attendance (Present, Late, Absent) and generates summaries per subject.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50">
                  <h2 className="text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-1">Student</h2>
                  <p className="text-sm text-gray-800">
                    Logs in to view their personal attendance record and percentage.
                  </p>
                  <p className="mt-1 text-xs text-indigo-900/70">
                    Monitors absences and present rates across enrolled subjects.
                  </p>
                </div>
              </section>

              <OverviewSection overview={overview} />

              <section className="mt-6 border border-gray-200 rounded-xl p-4 md:p-5 bg-gray-50">
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
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      Classes: {overview?.classCount ?? '—'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Use the sections in the left sidebar to drill down into each area (Students, Teachers, Classes,
                  Subjects) and perform add, edit, update, and delete operations.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Students</h2>
                  <p className="text-sm text-gray-600">Manage registered students and their enrollments.</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={openAddStudent}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add student
                  </button>
                  <div className="flex flex-row gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      value={studentSearchDraft}
                      onChange={(e) => setStudentSearchDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setStudentSearch(studentSearchDraft);
                      }}
                      placeholder="Filter by ID, name, email, department, year"
                      className="w-full md:w-56 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setStudentSearch(studentSearchDraft)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {Object.keys(enrollmentDepartmentYearMap).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(enrollmentDepartmentYearMap).map(([dept, info]) => (
                    <div
                      key={dept}
                      className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
                            {dept}
                          </p>
                          <p className="text-[11px] text-blue-900/80">
                            {info.total} student{info.total === 1 ? '' : 's'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentSearch(dept);
                            setStudentSearchDraft(dept);
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-white text-[11px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50"
                        >
                          Filter
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(info.years).map(([year, count]) => {
                          const label = year === 'N/A' ? 'Year N/A' : `Year ${year}`;
                          const term = `${dept} ${year}`;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setStudentSearch(term);
                                setStudentSearchDraft(term);
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[11px] text-blue-800 border border-blue-200 hover:bg-blue-50"
                            >
                              {label}
                              <span className="ml-1 text-[10px] text-blue-600">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Year level</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudentUsers.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2 text-gray-900">{s.name}</td>
                        <td className="px-4 py-2 text-gray-700">{s.email}</td>
                        <td className="px-4 py-2 text-gray-700">{s.studentDepartment || 'N/A'}</td>
                        <td className="px-4 py-2 text-gray-700">{s.studentYear || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditStudent(s)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(s)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudentUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No students found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {addingEnrollment && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add enrollment</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="enrollment-student" className="block text-xs font-medium text-gray-700 mb-1">
                      Student
                    </label>
                    <select
                      id="enrollment-student"
                      name="studentId"
                      value={enrollmentForm.studentId}
                      onChange={handleEnrollmentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a student</option>
                      {filteredEnrollmentStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.name} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="enrollment-teacher" className="block text-xs font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      id="enrollment-teacher"
                      name="teacherId"
                      value={enrollmentForm.teacherId}
                      onChange={handleEnrollmentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a teacher</option>
                      {filteredEnrollmentTeachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.id} - {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="enrollment-subject" className="block text-xs font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="enrollment-subject"
                      name="subjectId"
                      value={enrollmentForm.subjectId}
                      onChange={handleEnrollmentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a subject</option>
                      {filteredEnrollmentSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.code || ''} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="enrollment-class" className="block text-xs font-medium text-gray-700 mb-1">
                      Class / Section
                    </label>
                    <select
                      id="enrollment-class"
                      name="classId"
                      value={enrollmentForm.classId}
                      onChange={handleEnrollmentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a class</option>
                      {classList.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddEnrollment}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={enrollmentSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateEnrollment}
                    disabled={enrollmentSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {enrollmentSaving ? 'Saving...' : 'Create enrollment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'enrollments' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Enrollments</h2>
                  <p className="text-sm text-gray-600">
                    Links students to classes, subjects, and teachers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openAddEnrollment}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add enrollment
                  </button>
                </div>
              </div>

              {Object.keys(studentDepartmentYearMap).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(studentDepartmentYearMap).map(([dept, info]) => (
                    <div
                      key={dept}
                      className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
                            {dept}
                          </p>
                          <p className="text-[11px] text-blue-900/80">
                            {info.total} student{info.total === 1 ? '' : 's'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEnrollmentStudentFilter(dept);
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-white text-[11px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50"
                        >
                          Filter
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(info.years).map(([year, count]) => {
                          const label = year === 'N/A' ? 'Year N/A' : `Year ${year}`;
                          const term = `${dept} ${year}`;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setEnrollmentStudentFilter(term);
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[11px] text-blue-800 border border-blue-200 hover:bg-blue-50"
                            >
                              {label}
                              <span className="ml-1 text-[10px] text-blue-600">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Enrollment ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Class</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Year level</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Class instructor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEnrollmentList && filteredEnrollmentList.length > 0 ? (
                      filteredEnrollmentList.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="text-xs text-gray-900">
                              {row.class?.name || '—'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              classId: {row.classId}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="text-xs text-gray-900">
                              {row.subject ? `${row.subject.code} - ${row.subject.name}` : '—'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              subjectId: {row.subjectId}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="text-xs text-gray-900">
                              {row.student?.name || '—'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {row.student?.email || ''}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              studentId: {row.studentId}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="text-xs text-gray-900">{row.student?.studentYear || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="text-xs text-gray-900">
                              {row.teacher?.name || '—'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {row.teacher?.email || ''}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              teacherId: {row.teacherId}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No enrollments found yet.
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
                  <p className="text-sm text-gray-600">Manage teacher accounts and assignments.</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full md:w-auto">
                  <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                      value={teacherDepartmentFilter}
                      onChange={(e) => setTeacherDepartmentFilter(e.target.value)}
                      className="w-full md:w-40 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All departments</option>
                      {Array.from(new Set(teacherUsers.map(t => t.teacherCourse).filter(Boolean))).map(course => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    <select
                      value={teacherYearFilter}
                      onChange={(e) => setTeacherYearFilter(e.target.value)}
                      className="w-full md:w-32 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All levels</option>
                      {Array.from(new Set(teacherUsers.map(t => t.teacherLevel).filter(Boolean))).map(level => (
                        <option key={level} value={level}>
                          {`Level ${level}`}
                        </option>
                      ))}
                    </select>
                    {teacherYearFilter && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                        {`Level ${teacherYearFilter}`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openAddTeacher}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add teacher
                  </button>
                </div>
              </div>
              {Object.keys(teacherCourseLevelMap).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(teacherCourseLevelMap).map(([course, info]) => (
                    <div
                      key={course}
                      className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                            {course}
                          </p>
                          <p className="text-[11px] text-emerald-900/80">
                            {info.total} teacher{info.total === 1 ? '' : 's'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherDepartmentFilter(course);
                            setTeacherYearFilter('');
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-white text-[11px] font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                        >
                          Filter
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(info.levels).map(([level, count]) => {
                          const label = level === 'N/A' ? 'Level N/A' : `Level ${level}`;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                setTeacherDepartmentFilter(course);
                                setTeacherYearFilter(level);
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[11px] text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                            >
                              {label}
                              <span className="ml-1 text-[10px] text-emerald-700">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {teacherDepartmentFilter && teacherYearFilter ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Course Instructor</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Course Instructor - Subject code</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Year level</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTeacherUsers.map(t => {
                        const teacherEnrollments = enrollmentList.filter(e => e.teacherId === t.id && e.subject);
                        const subjectCodes = [];
                        const subjectDescriptions = [];
                        const seenSubjectIds = new Set();

                        teacherEnrollments.forEach(e => {
                          if (!e.subject || seenSubjectIds.has(e.subjectId)) return;
                          seenSubjectIds.add(e.subjectId);
                          if (e.subject.code) subjectCodes.push(e.subject.code);
                          if (e.subject.name || e.subject.description) {
                            subjectDescriptions.push(e.subject.name || e.subject.description);
                          }
                        });

                        const codesText = subjectCodes.length > 0 ? subjectCodes.join(', ') : '—';
                        const descText = subjectDescriptions.length > 0 ? subjectDescriptions.join(', ') : '—';

                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-xs text-gray-500">{t.id}</td>
                            <td className="px-4 py-2 text-gray-900">
                              <div className="text-xs text-gray-900">{t.name}</div>
                              <div className="text-[11px] text-gray-500">{t.email}</div>
                              <div className="text-[11px] text-gray-500">{t.teacherCourse || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-2 text-gray-700">{codesText}</td>
                            <td className="px-4 py-2 text-gray-700">{descText}</td>
                            <td className="px-4 py-2 text-gray-700">{t.teacherLevel || 'N/A'}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditTeacher(t)}
                                  className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeacher(t)}
                                  className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTeacherUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-4 text-xs text-center text-gray-400"
                          >
                            No teachers found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-500">
                  Select a department and year level to see detailed course instructor assignments.
                </div>
              )}
            </div>
          )}

          {activeSection === 'classes' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Classes </h2>
                  <p className="text-sm text-gray-600">Existing classes that group students and subjects.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openAddClass}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add class
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classList.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{c.id}</td>
                        <td className="px-4 py-2 text-gray-900">{c.name}</td>
                        <td className="px-4 py-2 text-gray-700">{c.description || '—'}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditClass(c)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClass(c)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {classList.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No classes configured yet.
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Subjects</h2>
                  <p className="text-sm text-gray-600">Subjects that teachers can teach and students can enroll in.</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={openAddSubject}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add subject
                  </button>
                  <div className="flex flex-row gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      value={subjectSearchDraft}
                      onChange={(e) => setSubjectSearchDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSubjectSearch(subjectSearchDraft);
                      }}
                      placeholder="Filter by ID, code, name, description"
                      className="w-full md:w-56 px-3 py-1.5 border border-gray-300 rounded-md text-xs shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSubjectSearch(subjectSearchDraft)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(subjectDepartmentYearMap || {}).length > 0 ? (
                  Object.entries(subjectDepartmentYearMap).map(([dept, info]) => (
                    <div
                      key={dept}
                      className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide">
                            {dept}
                          </p>
                          <p className="text-[11px] text-indigo-900/80">
                            {info.total} student{info.total === 1 ? '' : 's'} enrolled
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubjectSearch(dept);
                            setSubjectSearchDraft(dept);
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-white text-[11px] font-medium text-indigo-700 border border-indigo-200 hover:bg-indigo-50"
                        >
                          Filter
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(info.years || {}).map(([year, count]) => {
                          const label = year === 'N/A' ? 'Year N/A' : `Year ${year}`;
                          const term = `${dept} ${year}`;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setSubjectSearch(term);
                                setSubjectSearchDraft(term);
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[11px] text-indigo-800 border border-indigo-200 hover:bg-indigo-50"
                            >
                              {label}
                              <span className="ml-1 text-[10px] text-indigo-600">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 px-3 py-2 text-xs text-indigo-900 flex flex-col gap-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide">No department data yet</p>
                    <p className="text-[11px]">
                      Once students are enrolled in subjects with department and year information, summary cards by
                      department and year will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Timeframe</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubjects.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2 text-gray-900">{s.code || '—'}</td>
                        <td className="px-4 py-2 text-gray-900">{s.name}</td>
                        <td className="px-4 py-2 text-gray-700">{s.description || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">2025-2026</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditSubject(s)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(s)}
                              className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSubjects.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-xs text-center text-gray-400"
                        >
                          No subjects configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Attendance overview</h2>
                <p className="text-sm text-gray-600">
                  Review attendance by department, class, and month. This view is a starting point for analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Department focus</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Filter attendance grouped by department (e.g. BSIT, BSHM, BSCJ) and see present/late/absent trends.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Monthly trend</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Select a month to highlight spikes in absences and late arrivals across all classes.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">At-risk students</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Identify students with low attendance percentages for follow-up and intervention.
                  </p>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 text-xs text-gray-500">
                This area can later be connected to real aggregated attendance data and charts (per department, per
                class, per month).
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Reports & printing</h2>
                <p className="text-sm text-gray-600">
                  Generate attendance reports and summaries by student, subject, or date range.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Per-student report</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Generate a detailed attendance summary for a single student across all subjects.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Per-subject report</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Summarize attendance by subject, class, and teacher for a selected period.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Printable export</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Prepare a print-ready or downloadable copy of the selected report (PDF/Excel).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-blue-200 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    Print / download
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Notifications from teachers</h2>
                <p className="text-sm text-gray-600">
                  Review reports and notifications submitted by teachers for administrator follow-up.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Unread
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Resolved
                  </button>
                </div>
                <div className="text-xs text-gray-500">Future: connect to a notifications table or messaging system.</div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">From</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Message</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">Sample teacher</td>
                      <td className="px-4 py-2 text-gray-700">Attendance concern</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">
                        Placeholder notification. Connect this table to real teacher reports and messages.
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs">
                          Unread
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {editingStudent && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit student</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="student-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      id="student-name"
                      name="name"
                      type="text"
                      value={studentForm.name}
                      onChange={handleStudentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="student-email"
                      name="email"
                      type="email"
                      value={studentForm.email}
                      onChange={handleStudentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-department" className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      id="student-department"
                      name="studentDepartment"
                      type="text"
                      value={studentForm.studentDepartment}
                      onChange={handleStudentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-year" className="block text-xs font-medium text-gray-700 mb-1">
                      Year level
                    </label>
                    <input
                      id="student-year"
                      name="studentYear"
                      type="text"
                      value={studentForm.studentYear}
                      onChange={handleStudentFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditStudent}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={studentSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStudent}
                    disabled={studentSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {studentSaving ? 'Saving...' : 'Save changes'}
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
                    <label htmlFor="new-student-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      id="new-student-name"
                      name="name"
                      type="text"
                      value={newStudentForm.name}
                      onChange={handleNewStudentFormChange}
                      placeholder="Enter student's full name"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-student-email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="new-student-email"
                      name="email"
                      type="email"
                      value={newStudentForm.email}
                      onChange={handleNewStudentFormChange}
                      placeholder="Enter student email (e.g. juan@student.com)"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-student-department" className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      id="new-student-department"
                      name="studentDepartment"
                      type="text"
                      value={newStudentForm.studentDepartment}
                      onChange={handleNewStudentFormChange}
                      placeholder="e.g. BSIT, BSHM, BSCJ"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-student-year" className="block text-xs font-medium text-gray-700 mb-1">
                      Year level
                    </label>
                    <input
                      id="new-student-year"
                      name="studentYear"
                      type="text"
                      value={newStudentForm.studentYear}
                      onChange={handleNewStudentFormChange}
                      placeholder="e.g. 1, 2, 3"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddStudent}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={studentSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateStudent}
                    disabled={studentSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {studentSaving ? 'Saving...' : 'Create student'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {editingTeacher && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit teacher</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="teacher-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      id="teacher-name"
                      name="name"
                      type="text"
                      value={teacherForm.name}
                      onChange={handleTeacherFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacher-email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="teacher-email"
                      name="email"
                      type="email"
                      value={teacherForm.email}
                      onChange={handleTeacherFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacher-course" className="block text-xs font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <input
                      id="teacher-course"
                      name="teacherCourse"
                      type="text"
                      value={teacherForm.teacherCourse}
                      onChange={handleTeacherFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacher-level" className="block text-xs font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <input
                      id="teacher-level"
                      name="teacherLevel"
                      type="text"
                      value={teacherForm.teacherLevel}
                      onChange={handleTeacherFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditTeacher}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={teacherSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTeacher}
                    disabled={teacherSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {teacherSaving ? 'Saving...' : 'Save changes'}
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
                    <label htmlFor="new-teacher-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      id="new-teacher-name"
                      name="name"
                      type="text"
                      value={newTeacherForm.name}
                      onChange={handleNewTeacherFormChange}
                      placeholder="Enter teacher's full name"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-teacher-email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="new-teacher-email"
                      name="email"
                      type="email"
                      value={newTeacherForm.email}
                      onChange={handleNewTeacherFormChange}
                      placeholder="Enter teacher email (e.g. sir.garcia@school.com)"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-teacher-course" className="block text-xs font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <input
                      id="new-teacher-course"
                      name="teacherCourse"
                      type="text"
                      value={newTeacherForm.teacherCourse}
                      onChange={handleNewTeacherFormChange}
                      placeholder="e.g. Hospitality Management, Information Technology"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-teacher-level" className="block text-xs font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <input
                      id="new-teacher-level"
                      name="teacherLevel"
                      type="text"
                      value={newTeacherForm.teacherLevel}
                      onChange={handleNewTeacherFormChange}
                      placeholder="e.g. 1, 2, 3"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddTeacher}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={teacherSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTeacher}
                    disabled={teacherSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {teacherSaving ? 'Saving...' : 'Create teacher'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {editingClass && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit class</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="class-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="class-name"
                      name="name"
                      type="text"
                      value={classForm.name}
                      onChange={handleClassFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="class-description" className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="class-description"
                      name="description"
                      value={classForm.description}
                      onChange={handleClassFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditClass}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={classSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveClass}
                    disabled={classSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {classSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {addingClass && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add class</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="new-class-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="new-class-name"
                      name="name"
                      type="text"
                      value={newClassForm.name}
                      onChange={handleNewClassFormChange}
                      placeholder="e.g. BSIT 1-A, BSHM 2-B"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-class-description" className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="new-class-description"
                      name="description"
                      value={newClassForm.description}
                      onChange={handleNewClassFormChange}
                      placeholder="Short description of this class or section"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddClass}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={classSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateClass}
                    disabled={classSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {classSaving ? 'Saving...' : 'Create class'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {editingSubject && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit subject</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="subject-code" className="block text-xs font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      id="subject-code"
                      name="code"
                      type="text"
                      value={subjectForm.code}
                      onChange={handleSubjectFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="subject-name"
                      name="name"
                      type="text"
                      value={subjectForm.name}
                      onChange={handleSubjectFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject-description" className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="subject-description"
                      name="description"
                      value={subjectForm.description}
                      onChange={handleSubjectFormChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditSubject}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={subjectSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSubject}
                    disabled={subjectSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {subjectSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {addingSubject && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add subject</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label htmlFor="new-subject-code" className="block text-xs font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      id="new-subject-code"
                      name="code"
                      type="text"
                      value={newSubjectForm.code}
                      onChange={handleNewSubjectFormChange}
                      placeholder="e.g. IT101, HM201"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-subject-name" className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="new-subject-name"
                      name="name"
                      type="text"
                      value={newSubjectForm.name}
                      onChange={handleNewSubjectFormChange}
                      placeholder="e.g. Introduction to Information Technology"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-subject-description" className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="new-subject-description"
                      name="description"
                      value={newSubjectForm.description}
                      onChange={handleNewSubjectFormChange}
                      placeholder="Short description of the subject (topics, focus, etc.)"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddSubject}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={subjectSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSubject}
                    disabled={subjectSaving}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {subjectSaving ? 'Saving...' : 'Create subject'}
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
