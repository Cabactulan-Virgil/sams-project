import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const studentId = searchParams.get("studentId");
    const teacherId = searchParams.get("teacherId");
    const attendanceDate = searchParams.get("attendanceDate");

    let sql = "SELECT * FROM vw_attendance_detail WHERE 1=1";
    const params: any[] = [];

    if (classId) {
      sql += " AND class_id = ?";
      params.push(Number(classId));
    }

    if (subjectId) {
      sql += " AND subject_id = ?";
      params.push(Number(subjectId));
    }

    if (studentId) {
      sql += " AND student_id = ?";
      params.push(Number(studentId));
    }

    if (teacherId) {
      sql += " AND teacher_id = ?";
      params.push(Number(teacherId));
    }

    if (attendanceDate) {
      sql += " AND attendance_date = ?";
      params.push(attendanceDate);
    }

    sql += " ORDER BY attendance_date, class_name, subject_code, student_name";

    const rows = await query(sql, params);

    return NextResponse.json({ attendance: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load attendance." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enrollmentId, attendanceDate, status, recordedBy, remarks } = body as {
      enrollmentId?: number;
      attendanceDate?: string;
      status?: string;
      recordedBy?: number;
      remarks?: string | null;
    };

    if (!enrollmentId || !attendanceDate || !status || !recordedBy) {
      return NextResponse.json(
        { error: "enrollmentId, attendanceDate, status, and recordedBy are required." },
        { status: 400 }
      );
    }

    const allowedStatuses = ["present", "late", "absent"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid attendance status." },
        { status: 400 }
      );
    }

    const existing = (await query(
      "SELECT id FROM attendance WHERE enrollment_id = ? AND attendance_date = ? LIMIT 1",
      [enrollmentId, attendanceDate]
    )) as { id: number }[];

    if (existing.length === 0) {
      await query(
        "INSERT INTO attendance (enrollment_id, attendance_date, status, recorded_by, remarks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        [enrollmentId, attendanceDate, status, recordedBy, remarks || null]
      );
    } else {
      const id = existing[0].id;
      await query(
        "UPDATE attendance SET status = ?, recorded_by = ?, remarks = ?, updated_at = NOW() WHERE id = ?",
        [status, recordedBy, remarks || null, id]
      );
    }

    return NextResponse.json({ message: "Attendance saved." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save attendance." },
      { status: 500 }
    );
  }
}
