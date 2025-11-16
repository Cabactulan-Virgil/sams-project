import TeacherDashboard from '../components/layout/TeacherDashboard';
import { getUserFromRequest } from '../lib/auth';
import prisma from '../lib/prisma';

export default function TeacherPage({ user, classes, subjects }) {
  return <TeacherDashboard user={user} classes={classes} subjects={subjects} />;
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'teacher') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const classes = await prisma.classSection.findMany();
  const subjects = await prisma.subject.findMany();

  return { props: { user, classes, subjects } };
}
