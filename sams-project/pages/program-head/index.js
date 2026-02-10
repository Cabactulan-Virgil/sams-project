import ProgramHeadDashboard from '../../components/layout/ProgramHeadDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

export default function ProgramHeadPage({ user, program, overview, students, teachers, attendance, notifications }) {
  return (
    <ProgramHeadDashboard
      user={user}
      program={program}
      overview={overview}
      students={students}
      teachers={teachers}
      attendance={attendance}
      classes={overview?.classes || []}
      subjects={overview?.subjects || []}
      enrollments={overview?.enrollments || []}
      teacherAttendanceActivity={overview?.teacherAttendanceActivity || []}
      notifications={notifications}
    />
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'program_head') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const program = user.teacherProgram || null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(todayIso);

  const [studentRows, teacherRows, teacherCount, programHeadCount, presentCount, lateCount, absentCount, classRows, subjectRows, enrollmentRows, attendanceRows, todayAttendanceRows] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'student',
        ...(program ? { studentDepartment: program } : {}),
      },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentDepartment: true,
        studentYear: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: {
        role: 'teacher',
        ...(program ? { teacherProgram: program } : {}),
      },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teacherProgram: true,
        teacherCourse: true,
        teacherLevel: true,
        createdAt: true,
      },
    }),
    prisma.user.count({
      where: {
        role: 'teacher',
        ...(program ? { teacherProgram: program } : {}),
      },
    }),
    prisma.user.count({
      where: {
        role: 'program_head',
        ...(program ? { teacherProgram: program } : {}),
      },
    }),
    prisma.attendance.count({
      where: {
        status: 'present',
        enrollment: {
          is: {
            users_enrollment_student_idTousers: {
              ...(program ? { studentDepartment: program } : {}),
            },
          },
        },
      },
    }),
    prisma.attendance.count({
      where: {
        status: 'late',
        enrollment: {
          is: {
            users_enrollment_student_idTousers: {
              ...(program ? { studentDepartment: program } : {}),
            },
          },
        },
      },
    }),
    prisma.attendance.count({
      where: {
        status: 'absent',
        enrollment: {
          is: {
            users_enrollment_student_idTousers: {
              ...(program ? { studentDepartment: program } : {}),
            },
          },
        },
      },
    }),
    prisma.classSection.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        section: true,
        school_year: true,
        created_at: true,
      },
    }),
    prisma.subject.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        created_at: true,
      },
    }),
    prisma.enrollment.findMany({
      orderBy: { id: 'desc' },
      where: {
        users_enrollment_student_idTousers: {
          ...(program ? { studentDepartment: program } : {}),
        },
      },
      select: {
        id: true,
        student_id: true,
        subject_id: true,
        class_id: true,
        teacher_id: true,
        created_at: true,
      },
    }),
    prisma.attendance.findMany({
      orderBy: [{ attendance_date: 'desc' }, { id: 'desc' }],
      take: 50,
      where: {
        enrollment: {
          is: {
            users_enrollment_student_idTousers: {
              ...(program ? { studentDepartment: program } : {}),
            },
          },
        },
      },
      select: {
        id: true,
        enrollment_id: true,
        attendance_date: true,
        status: true,
        recorded_by: true,
        remarks: true,
        created_at: true,
        updated_at: true,
        enrollment: {
          select: {
            users_enrollment_student_idTousers: {
              select: {
                name: true,
                email: true,
              },
            },
            classes: {
              select: {
                id: true,
                name: true,
              },
            },
            subjects: {
              select: {
                code: true,
                name: true,
              },
            },
            users_enrollment_teacher_idTousers: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.attendance.findMany({
      where: {
        attendance_date: todayDate,
        enrollment: {
          is: {
            users_enrollment_student_idTousers: {
              ...(program ? { studentDepartment: program } : {}),
            },
          },
        },
      },
      select: {
        id: true,
        recorded_by: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProgram: true,
            teacherCourse: true,
            teacherLevel: true,
          },
        },
      },
    }),
  ]);

  let notifications = null;
  if (prisma.notification?.findMany) {
    try {
      notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (err) {
      console.error('Program head notifications load failed', err);
      notifications = [];
    }
  }

  const safeStudents = studentRows.map(s => ({
    ...s,
    createdAt: toIso(s.createdAt),
  }));

  const safeTeachers = teacherRows.map(t => ({
    ...t,
    createdAt: toIso(t.createdAt),
  }));

  const safeClasses = (classRows || []).map(c => ({
    ...c,
    created_at: toIso(c.created_at),
  }));

  const safeSubjects = (subjectRows || []).map(s => ({
    ...s,
    created_at: toIso(s.created_at),
  }));

  const safeEnrollments = (enrollmentRows || []).map(e => ({
    ...e,
    created_at: toIso(e.created_at),
  }));

  const attendance = attendanceRows.map(a => ({
    id: a.id,
    enrollment_id: a.enrollment_id,
    attendance_date: toIso(a.attendance_date),
    status: a.status,
    recorded_by: a.recorded_by,
    remarks: a.remarks,
    created_at: toIso(a.created_at),
    updated_at: toIso(a.updated_at),
    studentName: a.enrollment?.users_enrollment_student_idTousers?.name || '',
    studentEmail: a.enrollment?.users_enrollment_student_idTousers?.email || '',
    subjectLabel: a.enrollment?.subjects
      ? `${a.enrollment.subjects.code} - ${a.enrollment.subjects.name}`
      : '',
    className: a.enrollment?.classes?.name || '',
    teacherName: a.enrollment?.users_enrollment_teacher_idTousers?.name || '',
    recordedByName: a.users?.name || '',
  }));

  const teacherActivityMap = new Map();
  (todayAttendanceRows || []).forEach(row => {
    const teacher = row.users;
    if (!teacher) return;
    const existing = teacherActivityMap.get(teacher.id);
    if (existing) {
      existing.recordsCount += 1;
    } else {
      teacherActivityMap.set(teacher.id, {
        teacherId: teacher.id,
        name: teacher.name,
        email: teacher.email,
        teacherProgram: teacher.teacherProgram,
        teacherCourse: teacher.teacherCourse,
        teacherLevel: teacher.teacherLevel,
        recordsCount: 1,
        date: todayIso,
      });
    }
  });
  const teacherAttendanceActivity = Array.from(teacherActivityMap.values()).sort((a, b) => b.recordsCount - a.recordsCount);

  const overview = {
    studentCount: safeStudents.length,
    teacherCount,
    programHeadCount,
    attendanceCounts: {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
    },
    classes: safeClasses,
    subjects: safeSubjects,
    enrollments: safeEnrollments,
    teacherAttendanceActivity,
  };

  return {
    props: {
      user,
      program,
      overview,
      students: safeStudents,
      teachers: safeTeachers,
      attendance,
      notifications,
    },
  };
}
