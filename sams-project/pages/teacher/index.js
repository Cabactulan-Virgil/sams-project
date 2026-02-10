import TeacherDashboard from '../../components/teacher/TeacherDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

export default function TeacherPage({ user, classes, subjects, students, teacherCount, programHeadCount }) {
  return (
    <TeacherDashboard
      user={user}
      classes={classes}
      subjects={subjects}
      students={students}
      teacherCount={teacherCount}
      programHeadCount={programHeadCount}
    />
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'teacher') return { redirect: { destination: '/login', permanent: false } };

  const [classes, subjects, students, teacherCount, programHeadCount] = await Promise.all([
    prisma.classSection.findMany(),
    prisma.subject.findMany(),
    prisma.user.findMany({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.user.count({ where: { role: 'program_head' } }),
  ]);

  const safeClasses = classes.map(c => ({
    ...c,
    created_at: toIso(c.created_at),
  }));

  const safeSubjects = subjects.map(s => ({
    ...s,
    created_at: toIso(s.created_at),
  }));

  const safeStudents = students.map(s => ({
    ...s,
    createdAt: toIso(s.createdAt),
  }));

  return { props: { user, classes: safeClasses, subjects: safeSubjects, students: safeStudents, teacherCount, programHeadCount } };
}
