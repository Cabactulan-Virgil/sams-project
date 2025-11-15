import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = (await query(
      "SELECT id, name, section, school_year AS schoolYear, created_at AS createdAt FROM classes ORDER BY name ASC",
      []
    )) as {
      id: number;
      name: string;
      section: string | null;
      schoolYear: string | null;
      createdAt: string;
    }[];

    return NextResponse.json({ classes: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load classes." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, section, schoolYear } = body as {
      name?: string;
      section?: string;
      schoolYear?: string;
    };

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required." },
        { status: 400 }
      );
    }

    await query(
      "INSERT INTO classes (name, section, school_year, created_at) VALUES (?, ?, ?, NOW())",
      [name, section || null, schoolYear || null]
    );

    return NextResponse.json({ message: "Class created." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create class." },
      { status: 500 }
    );
  }
}
