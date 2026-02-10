import AdminDashboard from '../../components/layout/AdminDashboard';
import { getUserFromRequest } from '../../lib/auth';
import prisma from '../../lib/prisma';

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

export default function AdminPage({
  user,
  overview,
  users,
  classes,
  subjects,
  subjectStudentCounts,
  subjectFilterTags,
  enrollments,
  attendanceSummary,
  recentAttendance,
  subjectAttendanceReport,
  notifications,
}) {
  return (
    <AdminDashboard
      user={user}
      overview={overview}
      users={users}
      classes={classes}
      subjects={subjects}
      subjectStudentCounts={subjectStudentCounts}
      subjectFilterTags={subjectFilterTags}
      enrollments={enrollments}
      attendanceSummary={attendanceSummary}
      recentAttendance={recentAttendance}
      subjectAttendanceReport={subjectAttendanceReport}
      notifications={notifications}
    />
  );
}

export async function getServerSideProps({ req }) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const today = new Date();
  const from30Days = new Date(today);
  from30Days.setDate(from30Days.getDate() - 30);

  const [studentCount, teacherCount, programHeadCount, classRows, userRows, subjectRows, enrollmentRows, attendanceGroups, recentAttendanceRows, last30DaysAttendanceRows] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.user.count({ where: { role: 'program_head' } }),
    prisma.classSection.findMany(),
    prisma.user.findMany(),
    prisma.subject.findMany(),
    prisma.enrollment.findMany({
      select: {
        id: true,
        student_id: true,
        teacher_id: true,
        subject_id: true,
        class_id: true,
        users_enrollment_student_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            studentDepartment: true,
            studentYear: true,
          },
        },
        users_enrollment_teacher_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subjects: {
          select: { id: true, code: true, name: true },
        },
        classes: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.attendance.findMany({
      orderBy: [{ attendance_date: 'desc' }, { id: 'desc' }],
      take: 50,
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
            classes: { select: { id: true, name: true } },
            subjects: { select: { id: true, code: true, name: true } },
            users_enrollment_student_idTousers: {
              select: {
                id: true,
                name: true,
                email: true,
                studentDepartment: true,
                studentYear: true,
              },
            },
            users_enrollment_teacher_idTousers: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                teacherCourse: true,
                teacherLevel: true,
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
      where: { attendance_date: { gte: from30Days } },
      select: {
        status: true,
        enrollment: {
          select: {
            subjects: { select: { id: true, code: true, name: true } },
          },
        },
      },
    }),
  ]);

  const notificationRows = [];

  const overview = { studentCount, teacherCount, programHeadCount, classCount: classRows.length };

  const subjectStudentCounts = enrollmentRows.reduce((acc, row) => {
    const dept = row.users_enrollment_student_idTousers?.studentDepartment || 'Unassigned';
    const year = row.users_enrollment_student_idTousers?.studentYear || 'N/A';

    if (!acc[dept]) {
      acc[dept] = { total: 0, years: {} };
    }

    acc[dept].total += 1;
    acc[dept].years[year] = (acc[dept].years[year] || 0) + 1;

    return acc;
  }, {});

  const rawSubjectFilterTags = enrollmentRows.reduce((acc, row) => {
    const subjectId = row.subjects?.id;
    if (!subjectId) return acc;

    if (!acc[subjectId]) {
      acc[subjectId] = {
        departments: new Set(),
        years: new Set(),
      };
    }

    const dept = row.users_enrollment_student_idTousers?.studentDepartment;
    const year = row.users_enrollment_student_idTousers?.studentYear;

    if (dept) acc[subjectId].departments.add(dept);
    if (year) acc[subjectId].years.add(year);

    return acc;
  }, {});

  const subjectFilterTags = Object.keys(rawSubjectFilterTags).reduce((acc, key) => {
    const info = rawSubjectFilterTags[key];
    acc[key] = {
      departments: Array.from(info.departments),
      years: Array.from(info.years),
    };
    return acc;
  }, {});

  const safeUsers = userRows.map(u => ({
    ...u,
    createdAt: toIso(u.createdAt),
  }));

  const safeClasses = classRows.map(c => ({
    ...c,
    created_at: toIso(c.created_at),
  }));

  const safeSubjects = subjectRows.map(s => ({
    ...s,
    created_at: toIso(s.created_at),
  }));

  const safeEnrollments = enrollmentRows.map(e => ({
    ...e,
    created_at: toIso(e.created_at),
  }));

  const attendanceSummary = (attendanceGroups || []).reduce(
    (acc, row) => {
      acc[String(row.status)] = row._count?.id ?? 0;
      return acc;
    },
    { present: 0, late: 0, absent: 0 }
  );

  const recentAttendance = (recentAttendanceRows || []).map(r => ({
    id: r.id,
    enrollment_id: r.enrollment_id,
    attendance_date: toIso(r.attendance_date),
    status: r.status,
    remarks: r.remarks,
    created_at: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
    class: r.enrollment?.classes || null,
    subject: r.enrollment?.subjects || null,
    student: r.enrollment?.users_enrollment_student_idTousers || null,
    teacher: r.enrollment?.users_enrollment_teacher_idTousers || null,
    recordedBy: r.users || null,
  }));

  const subjectAttendanceReportMap = (last30DaysAttendanceRows || []).reduce((acc, row) => {
    const subj = row.enrollment?.subjects;
    if (!subj?.id) return acc;
    if (!acc[subj.id]) {
      acc[subj.id] = {
        subjectId: subj.id,
        code: subj.code,
        name: subj.name,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
      };
    }
    if (row.status === 'present') acc[subj.id].presentCount += 1;
    if (row.status === 'late') acc[subj.id].lateCount += 1;
    if (row.status === 'absent') acc[subj.id].absentCount += 1;
    return acc;
  }, {});

  const subjectAttendanceReport = Object.values(subjectAttendanceReportMap).map(r => {
    const total = r.presentCount + r.lateCount + r.absentCount;
    const attendancePercentage = total > 0 ? Math.round((r.presentCount / total) * 100) : null;
    return { ...r, total, attendancePercentage };
  });

  return {
    props: {
      user,
      overview,
      users: safeUsers,
      classes: safeClasses,
      subjects: safeSubjects,
      subjectStudentCounts,
      subjectFilterTags,
      enrollments: safeEnrollments,
      attendanceSummary,
      recentAttendance,
      subjectAttendanceReport,
      notifications: notificationRows,
    },
  };
}
