import { getUserFromRequest } from '../lib/auth';
import { PrismaClient } from '@prisma/client';
import AdminDashboardLayout from '../components/layout/AdminDashboard';
const prisma = new PrismaClient();


export default function AdminPage({ user, overview, users, classes, subjects }) {
  return (
    <AdminDashboardLayout
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

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (user.role !== 'admin') {
    let destination = '/student';
    if (user.role === 'teacher') destination = '/teacher';

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  let overview = null;
  let users = [];
  let classes = [];
  let subjects = [];

  try {
    if (process.env.DATABASE_URL) {
      const [
        studentCount,
        teacherCount,
        classCount,
        userRows,
        classRows,
        subjectRows,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'student' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.classSection.count(),
        prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true },
          orderBy: { id: 'asc' },
        }),
        prisma.classSection.findMany({
          select: { id: true, name: true, description: true },
          orderBy: { id: 'asc' },
        }),
        prisma.subject.findMany({
          select: { id: true, code: true, name: true, description: true },
          orderBy: { id: 'asc' },
        }),
      ]);

      overview = {
        studentCount,
        teacherCount,
        classCount,
      };

      users = userRows;
      classes = classRows;
      subjects = subjectRows;
    }
  } catch (err) {
    console.error('Admin overview Prisma error', err);
    overview = null;
    users = [];
    classes = [];
    subjects = [];
  }

  return {
    props: {
      user,
      overview,
      users,
      classes,
      subjects,
    },
  };
}
