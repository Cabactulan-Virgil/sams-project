import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let sql = "SELECT id, name, email, role FROM users";
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
