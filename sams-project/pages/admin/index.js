import AdminDashboardLayout from '../../components/admin/AdminDashboardLayout';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function AdminDashboard({ user, overview }) {
  return <AdminDashboardLayout user={user} overview={overview} />;
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

  const [studentCount, teacherCount, classCount] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.classSection.count(),
  ]);

  return {
    props: {
      user,
      overview: {
        studentCount,
        teacherCount,
        classCount,
      },
    },
  };
}
