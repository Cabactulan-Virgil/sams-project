import StudentDashboardLayout from '../../components/layout/StudentDashboardLayout';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function StudentPage({ user, enrollments }) {
  return <StudentDashboardLayout user={user} enrollments={enrollments} />;
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'student') return { redirect: { destination: '/login', permanent: false } };

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: { class: true, subject: true }
  });

  return { props: { user, enrollments } };
}
