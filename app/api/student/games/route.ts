import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch student profile
    const studentProfile = await sql`
      SELECT sp.*, u.full_name
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = ${user.id}
    `

    // Fetch all active games
    const games = await sql`
      SELECT * FROM games
      WHERE is_active = true
      ORDER BY difficulty_level, title
    `

    return NextResponse.json({
      user,
      student: studentProfile[0] || null,
      games,
    })
  } catch (error) {
    console.error("Failed to fetch games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}
