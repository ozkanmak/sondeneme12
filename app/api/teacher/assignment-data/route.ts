import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const students = await sql`
    SELECT u.id, u.full_name
    FROM teacher_students ts
    JOIN users u ON ts.student_id = u.id
    WHERE ts.teacher_id = ${user.id}
    ORDER BY u.full_name
  `

  const games = await sql`
    SELECT id, title, category, difficulty_level
    FROM games
    ORDER BY category, title
  `

  return NextResponse.json({ students, games })
}
