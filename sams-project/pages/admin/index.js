import AdminDashboard from '../../components/layout/AdminDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

export default function AdminPage({
  user,
  overview,
  users,
  classes,
  subjects,
  subjectStudentCounts,
  subjectFilterTags,
  enrollments,
  notifications,
}) {
  return (
    <AdminDashboard
      user={user}
      overview={overview}
      users={users}
      classes={classes}
      subjects={subjects}
      subjectStudentCounts={subjectStudentCounts}
      subjectFilterTags={subjectFilterTags}
      enrollments={enrollments}
      notifications={notifications}
    />
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const [studentCount, teacherCount, classRows, userRows, subjectRows, enrollmentRows] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.classSection.findMany(),
    prisma.user.findMany(),
    prisma.subject.findMany(),
    prisma.enrollment.findMany({
      select: {
        id: true,
        student_id: true,
        teacher_id: true,
        subject_id: true,
        class_id: true,
        users_enrollment_student_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            studentDepartment: true,
            studentYear: true,
          },
        },
        users_enrollment_teacher_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subjects: {
          select: { id: true, code: true, name: true },
        },
        classes: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const notificationRows = [];

  const overview = { studentCount, teacherCount, classCount: classRows.length };

  const subjectStudentCounts = enrollmentRows.reduce((acc, row) => {
    const dept = row.users_enrollment_student_idTousers?.studentDepartment || 'Unassigned';
    const year = row.users_enrollment_student_idTousers?.studentYear || 'N/A';

    if (!acc[dept]) {
      acc[dept] = { total: 0, years: {} };
    }

    acc[dept].total += 1;
    acc[dept].years[year] = (acc[dept].years[year] || 0) + 1;

    return acc;
  }, {});

  const rawSubjectFilterTags = enrollmentRows.reduce((acc, row) => {
    const subjectId = row.subjects?.id;
    if (!subjectId) return acc;

    if (!acc[subjectId]) {
      acc[subjectId] = {
        departments: new Set(),
        years: new Set(),
      };
    }

    const dept = row.users_enrollment_student_idTousers?.studentDepartment;
    const year = row.users_enrollment_student_idTousers?.studentYear;

    if (dept) acc[subjectId].departments.add(dept);
    if (year) acc[subjectId].years.add(year);

    return acc;
  }, {});

  const subjectFilterTags = Object.keys(rawSubjectFilterTags).reduce((acc, key) => {
    const info = rawSubjectFilterTags[key];
    acc[key] = {
      departments: Array.from(info.departments),
      years: Array.from(info.years),
    };
    return acc;
  }, {});

  const safeUsers = userRows.map(u => ({
    ...u,
    createdAt: toIso(u.createdAt),
  }));

  const safeClasses = classRows.map(c => ({
    ...c,
    created_at: toIso(c.created_at),
  }));

  const safeSubjects = subjectRows.map(s => ({
    ...s,
    created_at: toIso(s.created_at),
  }));

  const safeEnrollments = enrollmentRows.map(e => ({
    ...e,
    created_at: toIso(e.created_at),
  }));

  return {
    props: {
      user,
      overview,
      users: safeUsers,
      classes: safeClasses,
      subjects: safeSubjects,
      subjectStudentCounts,
      subjectFilterTags,
      enrollments: safeEnrollments,
      notifications: notificationRows,
    },
  };
}
