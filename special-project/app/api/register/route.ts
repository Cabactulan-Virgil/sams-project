import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

const allowedRoles = ["admin", "student", "teacher"] as const;

type Role = (typeof allowedRoles)[number];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
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

    await query(
      "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, passwordHash, role]
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
