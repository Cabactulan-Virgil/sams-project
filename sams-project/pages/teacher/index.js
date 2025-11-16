import TeacherDashboardLayout from '../../components/layout/TeacherDashboardLayout';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function TeacherPage({ user, classes, subjects, students }) {
  return <TeacherDashboardLayout user={user} classes={classes} subjects={subjects} students={students} />;
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'teacher') return { redirect: { destination: '/login', permanent: false } };

  const classes = await prisma.classSection.findMany();
  const subjects = await prisma.subject.findMany();
  const students = await prisma.user.findMany({ where: { role: 'student' } });

  return { props: { user, classes, subjects, students } };
}
