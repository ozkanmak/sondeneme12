import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const students = await sql`
      SELECT u.id, u.full_name, sp.points, sp.level, sp.learning_disabilities
      FROM teacher_students ts
      JOIN users u ON ts.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ts.teacher_id = ${user.id}
      ORDER BY u.full_name
    `

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
