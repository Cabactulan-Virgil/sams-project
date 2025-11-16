import { getUserFromRequest } from '../../lib/auth';
import TeacherDashboardLayout from '../../components/teacher/TeacherDashboardLayout';

export default function TeacherDashboard({ user }) {
  return <TeacherDashboardLayout user={user} />;
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

  if (user.role !== 'teacher') {
    let destination = '/student';
    if (user.role === 'admin') destination = '/admin';

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
}
