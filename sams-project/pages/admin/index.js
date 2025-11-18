import AdminDashboard from '../../components/layout/AdminDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

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

  const [studentCount, teacherCount, classRows, userRows, subjectRows, enrollmentRows, notificationRows] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.classSection.findMany(),
    prisma.user.findMany(),
    prisma.subject.findMany(),
    prisma.enrollment.findMany({
      select: {
        id: true,
        studentId: true,
        teacherId: true,
        subjectId: true,
        classId: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentDepartment: true,
            studentYear: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subject: {
          select: { id: true, code: true, name: true },
        },
        class: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.notification.findMany({
      where: { type: 'registration' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const overview = { studentCount, teacherCount, classCount: classRows.length };

  const subjectStudentCounts = enrollmentRows.reduce((acc, row) => {
    const dept = row.student?.studentDepartment || 'Unassigned';
    const year = row.student?.studentYear || 'N/A';

    if (!acc[dept]) {
      acc[dept] = { total: 0, years: {} };
    }

    acc[dept].total += 1;
    acc[dept].years[year] = (acc[dept].years[year] || 0) + 1;

    return acc;
  }, {});

  const rawSubjectFilterTags = enrollmentRows.reduce((acc, row) => {
    const subjectId = row.subject?.id;
    if (!subjectId) return acc;

    if (!acc[subjectId]) {
      acc[subjectId] = {
        departments: new Set(),
        years: new Set(),
      };
    }

    const dept = row.student?.studentDepartment;
    const year = row.student?.studentYear;

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

  return {
    props: {
      user,
      overview,
      users: userRows,
      classes: classRows,
      subjects: subjectRows,
      subjectStudentCounts,
      subjectFilterTags,
      enrollments: enrollmentRows,
      notifications: notificationRows,
    },
  };
}
