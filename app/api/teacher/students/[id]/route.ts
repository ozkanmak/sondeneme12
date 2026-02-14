import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const studentId = Number.parseInt(params.id)

    // Verify this student belongs to this teacher
    const teacherStudents = await sql`
      SELECT * FROM teacher_students 
      WHERE teacher_id = ${user.id} AND student_id = ${studentId}
    `

    if (teacherStudents.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch student details
    const students = await sql`
      SELECT u.*, sp.*
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ${studentId}
    `

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Fetch student's game sessions
    const sessions = await sql`
      SELECT gs.*, g.title, g.category
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.student_id = ${studentId}
      ORDER BY gs.started_at DESC
      LIMIT 20
    `

    // Calculate stats
    const completedSessions = sessions.filter((s: any) => s.completed_at !== null)
    const avgScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completedSessions.length,
          )
        : 0

    const totalPlayTime = completedSessions.reduce((sum: number, s: any) => {
      const duration = s.time_spent_seconds || s.duration_seconds || 0
      return sum + duration
    }, 0)
    const playTimeMinutes = Math.round(totalPlayTime / 60)

    return NextResponse.json({
      student,
      sessions,
      completedSessions,
      avgScore,
      playTimeMinutes,
    })
  } catch (error) {
    console.error("Error fetching student data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
