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
        is: {
          student_id: user.id,
        },
      },
    },
  });

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  attendanceGroups.forEach(row => {
    if (row.status === 'present') presentCount = row._count.id;
    if (row.status === 'late') lateCount = row._count.id;
    if (row.status === 'absent') absentCount = row._count.id;
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
      student_id: user.id,
    },
    select: {
      id: true,
      subjects: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      classes: {
        select: {
          id: true,
          name: true,
        },
      },
      users_enrollment_teacher_idTousers: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const subjects = enrollmentRows.map(row => ({
    enrollmentId: row.id,
    subjectId: row.subjects ? row.subjects.id : null,
    subjectCode: row.subjects ? row.subjects.code : '',
    subjectName: row.subjects ? row.subjects.name : '',
    classId: row.classes ? row.classes.id : null,
    className: row.classes ? row.classes.name : '',
    teacherId: row.users_enrollment_teacher_idTousers ? row.users_enrollment_teacher_idTousers.id : null,
    teacherName: row.users_enrollment_teacher_idTousers ? row.users_enrollment_teacher_idTousers.name : '',
  }));

  return { props: { user, summary, subjects } };
}
