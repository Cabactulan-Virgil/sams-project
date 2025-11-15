import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    let sql = "SELECT * FROM vw_enrollment_detail WHERE 1=1";
    const params: any[] = [];

    if (teacherId) {
      sql += " AND teacher_id = ?";
      params.push(Number(teacherId));
    }

    if (studentId) {
      sql += " AND student_id = ?";
      params.push(Number(studentId));
    }

    if (classId) {
      sql += " AND class_id = ?";
      params.push(Number(classId));
    }

    if (subjectId) {
      sql += " AND subject_id = ?";
      params.push(Number(subjectId));
    }

    sql += " ORDER BY class_name, subject_code, student_name";

    const rows = await query(sql, params);

    return NextResponse.json({ enrollments: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load enrollments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, subjectId, classId, teacherId } = body as {
      studentId?: number;
      subjectId?: number;
      classId?: number | null;
      teacherId?: number;
    };

    if (!studentId || !subjectId || !teacherId) {
      return NextResponse.json(
        { error: "studentId, subjectId, and teacherId are required." },
        { status: 400 }
      );
    }

    try {
      await query(
        "INSERT INTO enrollment (student_id, subject_id, class_id, teacher_id, created_at) VALUES (?, ?, ?, ?, NOW())",
        [studentId, subjectId, classId ?? null, teacherId]
      );
    } catch (error: any) {
      if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "This student is already enrolled with that subject, class, and teacher." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ message: "Enrollment created." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create enrollment." },
      { status: 500 }
    );
  }
}
