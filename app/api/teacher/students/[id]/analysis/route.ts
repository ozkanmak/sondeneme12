import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify this student belongs to the teacher
    const studentCheck = await sql`
      SELECT ts.student_id 
      FROM teacher_students ts
      WHERE ts.teacher_id = ${user.id} AND ts.student_id = ${Number.parseInt(id)}
    `

    if (studentCheck.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get student info
    const studentResult = await sql`
      SELECT u.id, u.full_name, sp.points, sp.level, sp.learning_disabilities
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ${Number.parseInt(id)}
    `

    if (studentResult.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = studentResult[0]

    const sessions = await sql`
      SELECT 
        gs.id,
        gs.game_id,
        g.title as game_title,
        g.category,
        gs.score,
        gs.time_spent_seconds,
        gs.completed_at
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.student_id = ${Number.parseInt(id)}
      ORDER BY gs.started_at DESC
      LIMIT 20
    `

    return NextResponse.json({ student, sessions })
  } catch (error) {
    console.error("Error fetching student analysis data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
