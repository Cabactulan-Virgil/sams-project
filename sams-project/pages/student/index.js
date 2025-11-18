import StudentDashboardShell from '../../components/student/StudentDashboardShell';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

export default function StudentPage({ user, summary, subjects }) {
  return <StudentDashboardShell user={user} summary={summary} subjects={subjects} />;
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

  const enrollmentRows = await prisma.enrollment.findMany({
    where: {
      studentId: user.id,
    },
    select: {
      id: true,
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const subjects = enrollmentRows.map(row => ({
    enrollmentId: row.id,
    subjectId: row.subject ? row.subject.id : null,
    subjectCode: row.subject ? row.subject.code : '',
    subjectName: row.subject ? row.subject.name : '',
    classId: row.class ? row.class.id : null,
    className: row.class ? row.class.name : '',
    teacherId: row.teacher ? row.teacher.id : null,
    teacherName: row.teacher ? row.teacher.name : '',
  }));

  return { props: { user, summary, subjects } };
}
