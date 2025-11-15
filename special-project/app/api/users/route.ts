import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const allowedRoles = ["admin", "student", "teacher"] as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let sql =
      "SELECT id, name, email, role, program, course, level, department, year_level AS yearLevel FROM users";
    const params: any[] = [];

    if (role) {
      sql += " WHERE role = ?";
      params.push(role);
    }

    sql += " ORDER BY name ASC";

    const rows = (await query(sql, params)) as {
      id: number;
      name: string;
      email: string;
      role: string;
      program: string | null;
      course: string | null;
      level: string | null;
      department: string | null;
      yearLevel: string | null;
    }[];

    return NextResponse.json({ users: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load users." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, role, program, course, level, department, yearLevel } = body as {
      id?: number;
      name?: string;
      email?: string;
      role?: string;
      program?: string | null;
      course?: string | null;
      level?: string | null;
      department?: string | null;
      yearLevel?: string | null;
    };

    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { error: "User id, name, email, and role are required." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const normalizedProgram = role === "teacher" ? program || null : null;
    const normalizedCourse = role === "teacher" ? course || null : null;
    const normalizedLevel = role === "teacher" ? level || null : null;
    const normalizedDepartment = role === "student" ? department || null : null;
    const normalizedYearLevel = role === "student" ? yearLevel || null : null;

    await query(
      "UPDATE users SET name = ?, email = ?, role = ?, program = ?, course = ?, level = ?, department = ?, year_level = ? WHERE id = ?",
      [
        name,
        email,
        role,
        normalizedProgram,
        normalizedCourse,
        normalizedLevel,
        normalizedDepartment,
        normalizedYearLevel,
        id,
      ]
    );

    return NextResponse.json({ message: "User updated." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    const id = idParam ? Number(idParam) : NaN;
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Valid user id is required." },
        { status: 400 }
      );
    }

    await query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ message: "User deleted." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
