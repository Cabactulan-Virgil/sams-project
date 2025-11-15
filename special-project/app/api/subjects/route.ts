import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = (await query(
      "SELECT id, code, name, description, created_at AS createdAt FROM subjects ORDER BY code ASC",
      []
    )) as {
      id: number;
      code: string;
      name: string;
      description: string | null;
      createdAt: string;
    }[];

    return NextResponse.json({ subjects: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load subjects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, description } = body as {
      code?: string;
      name?: string;
      description?: string;
    };

    if (!code || !name) {
      return NextResponse.json(
        { error: "Subject code and name are required." },
        { status: 400 }
      );
    }

    await query(
      "INSERT INTO subjects (code, name, description, created_at) VALUES (?, ?, ?, NOW())",
      [code, name, description || null]
    );

    return NextResponse.json({ message: "Subject created." }, { status: 201 });
  } catch (error: any) {
    console.error(error);

    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Subject code already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subject." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, code, name, description } = body as {
      id?: number;
      code?: string;
      name?: string;
      description?: string | null;
    };

    if (!id || !code || !name) {
      return NextResponse.json(
        { error: "Subject id, code, and name are required." },
        { status: 400 }
      );
    }

    try {
      await query(
        "UPDATE subjects SET code = ?, name = ?, description = ? WHERE id = ?",
        [code, name, description || null, id]
      );
    } catch (error: any) {
      console.error(error);

      if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Subject code already exists." },
          { status: 409 }
        );
      }

      throw error;
    }

    return NextResponse.json({ message: "Subject updated." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update subject." },
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
        { error: "Valid subject id is required." },
        { status: 400 }
      );
    }

    await query("DELETE FROM subjects WHERE id = ?", [id]);

    return NextResponse.json({ message: "Subject deleted." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete subject." },
      { status: 500 }
    );
  }
}
