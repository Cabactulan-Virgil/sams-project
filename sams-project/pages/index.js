import { getUserFromRequest } from '../lib/auth';

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

  let destination = '/login';
  if (user.role === 'admin') destination = '/admin';
  if (user.role === 'teacher') destination = '/teacher';
  if (user.role === 'student') destination = '/student';

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
