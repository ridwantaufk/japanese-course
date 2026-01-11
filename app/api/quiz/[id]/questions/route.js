import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const result = await query(
      "SELECT * FROM quiz_questions WHERE quiz_set_id = $1 ORDER BY question_order ASC",
      [id]
    );

    return NextResponse.json({
      questions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz questions" },
      { status: 500 }
    );
  }
}
