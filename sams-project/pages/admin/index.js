import AdminDashboard from '../../components/layout/AdminDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function AdminPage({ user, overview, users, classes, subjects }) {
  return (
    <AdminDashboard
      user={user}
      overview={overview}
      users={users}
      classes={classes}
      subjects={subjects}
    />
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const [studentCount, teacherCount, classRows, userRows, subjectRows] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.classSection.findMany(),
    prisma.user.findMany(),
    prisma.subject.findMany(),
  ]);

  const overview = { studentCount, teacherCount, classCount: classRows.length };

  return { props: { user, overview, users: userRows, classes: classRows, subjects: subjectRows } };
}
