import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const department = searchParams.get("department");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required." },
        { status: 400 }
      );
    }

    let sql = `
      SELECT
        s.department AS department,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS presentCount,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS lateCount,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absentCount,
        COUNT(a.id) AS totalSessions
      FROM attendance a
      JOIN enrollment e ON e.id = a.enrollment_id
      JOIN users s ON s.id = e.student_id AND s.role = 'student'
      WHERE a.attendance_date BETWEEN ? AND ?
    `;

    const params: any[] = [startDate, endDate];

    if (department) {
      sql += " AND s.department = ?";
      params.push(department);
    }

    sql += " GROUP BY s.department ORDER BY s.department";

    const rows = (await query(sql, params)) as {
      department: string | null;
      presentCount: number | null;
      lateCount: number | null;
      absentCount: number | null;
      totalSessions: number;
    }[];

    const summary = rows.map((row) => {
      const total = row.totalSessions || 0;
      const attended = (row.presentCount || 0) + (row.lateCount || 0);
      const attendanceRate = total > 0 ? Number(((attended * 100) / total).toFixed(2)) : null;

      return {
        department: row.department,
        presentCount: row.presentCount || 0,
        lateCount: row.lateCount || 0,
        absentCount: row.absentCount || 0,
        totalSessions: row.totalSessions,
        attendanceRate,
      };
    });

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load attendance summary." },
      { status: 500 }
    );
  }
}
