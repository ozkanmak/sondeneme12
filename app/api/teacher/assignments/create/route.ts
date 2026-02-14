import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, gameId, dueDate, students } = await request.json()

  await sql`
    INSERT INTO assignments (title, description, teacher_id, game_id, due_date, target_students)
    VALUES (
      ${title},
      ${description},
      ${user.id},
      ${Number.parseInt(gameId)},
      ${dueDate},
      ${students}
    )
  `

  return NextResponse.json({ success: true })
}
