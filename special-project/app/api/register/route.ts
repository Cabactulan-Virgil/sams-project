import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

const allowedRoles = ["admin", "student", "teacher"] as const;

type Role = (typeof allowedRoles)[number];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      program,
      course,
      level,
      department,
      yearLevel,
    } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      program?: string;
      course?: string;
      level?: string;
      department?: string;
      yearLevel?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role as Role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    if (role === "teacher") {
      if (!program || !course || !level) {
        return NextResponse.json(
          { error: "Program, course, and level are required for teachers." },
          { status: 400 }
        );
      }
    }

    if (role === "student") {
      if (!department || !yearLevel) {
        return NextResponse.json(
          { error: "Department and year are required for students." },
          { status: 400 }
        );
      }
    }

    const existing = (await query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )) as { id: number }[];

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already in use." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const normalizedProgram = role === "teacher" ? program || null : null;
    const normalizedCourse = role === "teacher" ? course || null : null;
    const normalizedLevel = role === "teacher" ? level || null : null;
    const normalizedDepartment = role === "student" ? department || null : null;
    const normalizedYearLevel = role === "student" ? yearLevel || null : null;

    await query(
      "INSERT INTO users (name, email, password_hash, role, program, course, level, department, year_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        name,
        email,
        passwordHash,
        role,
        normalizedProgram,
        normalizedCourse,
        normalizedLevel,
        normalizedDepartment,
        normalizedYearLevel,
      ]
    );

    return NextResponse.json(
      {
        message: "User registered.",
        user: { name, email, role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
