import AdminDashboardLayout from '../../components/admin/AdminDashboardLayout';
import { getUserFromRequest } from '../../lib/auth';

export default function AdminDashboard({ user }) {
  return <AdminDashboardLayout user={user} />;
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

  return {
    props: {
      user,
    },
  };
}
