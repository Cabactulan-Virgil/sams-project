import AdminDashboard from '../../components/layout/AdminDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function AdminPage({ user, overview, users, classes, subjects, subjectStudentCounts }) {
  return (
    <AdminDashboard
      user={user}
      overview={overview}
      users={users}
      classes={classes}
      subjects={subjects}
      subjectStudentCounts={subjectStudentCounts}
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
        subject: {
          select: { name: true },
        },
      },
    }),
  ]);

  const overview = { studentCount, teacherCount, classCount: classRows.length };

  const subjectStudentCounts = enrollmentRows.reduce((acc, row) => {
    const subjectName = row.subject?.name || 'Unknown subject';
    acc[subjectName] = (acc[subjectName] || 0) + 1;
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
    },
  };
}
