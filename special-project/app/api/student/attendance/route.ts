import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!studentId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "studentId, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    let sql = `
      SELECT
        s.id AS studentId,
        s.name AS studentName,
        subj.id AS subjectId,
        subj.code AS subjectCode,
        subj.name AS subjectName,
        c.id AS classId,
        c.name AS className,
        c.section,
        c.school_year AS schoolYear,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS presentCount,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS lateCount,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absentCount,
        COUNT(a.id) AS totalSessions
      FROM enrollment e
      JOIN users s ON s.id = e.student_id
      JOIN subjects subj ON subj.id = e.subject_id
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN attendance a
        ON a.enrollment_id = e.id
       AND a.attendance_date BETWEEN ? AND ?
      WHERE e.student_id = ?
    `;

    const params: any[] = [startDate, endDate, Number(studentId)];

    if (subjectId) {
      sql += " AND e.subject_id = ?";
      params.push(Number(subjectId));
    }

    sql += `
      GROUP BY
        s.id,
        s.name,
        subj.id,
        subj.code,
        subj.name,
        c.id,
        c.name,
        c.section,
        c.school_year
      ORDER BY subj.code, c.name
    `;

    const rows = (await query(sql, params)) as {
      studentId: number;
      studentName: string;
      subjectId: number;
      subjectCode: string;
      subjectName: string;
      classId: number | null;
      className: string | null;
      section: string | null;
      schoolYear: string | null;
      presentCount: number | null;
      lateCount: number | null;
      absentCount: number | null;
      totalSessions: number;
    }[];

    const withPercentages = rows.map((row) => {
      const total = row.totalSessions || 0;
      const presentOrLate = (row.presentCount || 0) + (row.lateCount || 0);
      const percentage = total > 0 ? Number(((presentOrLate * 100) / total).toFixed(2)) : null;
      return { ...row, attendancePercentage: percentage };
    });

    return NextResponse.json({ summary: withPercentages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load attendance summary." },
      { status: 500 }
    );
  }
}
