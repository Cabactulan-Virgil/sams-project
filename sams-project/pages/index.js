import { getUserFromRequest } from '../lib/auth';

export default function Home() {
  return (
    <main style={{padding: '2rem', fontFamily: 'Arial'}}>
      <h1>SAMS — Admin Portal (Next.js)</h1>
      <p>Welcome. This is a minimal scaffold created from your previous project.</p>
      <p>Replace pages, components and API routes as needed.</p>
    </main>
  )
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

  let destination = '/student';
  if (user.role === 'admin') destination = '/admin';
  else if (user.role === 'teacher') destination = '/teacher';

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}
