import StudentDashboardLayout from '../../components/student/StudentDashboardLayout';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function StudentPage({ user, summary }) {
  return <StudentDashboardLayout user={user} summary={summary} />;
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'student') return { redirect: { destination: '/login', permanent: false } };

  const attendanceGroups = await prisma.attendance.groupBy({
    by: ['status'],
    _count: { id: true },
    where: {
      enrollment: {
        studentId: user.id,
      },
    },
  });

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  attendanceGroups.forEach(row => {
    if (row.status === 'PRESENT') presentCount = row._count.id;
    if (row.status === 'LATE') lateCount = row._count.id;
    if (row.status === 'ABSENT') absentCount = row._count.id;
  });

  const totalSessions = presentCount + lateCount + absentCount;
  const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;

  const summary = {
    presentCount,
    lateCount,
    absentCount,
    totalSessions,
    attendancePercentage,
  };

  return { props: { user, summary } };
}
