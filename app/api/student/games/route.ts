import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(user.id)

    // Fetch student profile (optional - sayfa yine de çalışsın)
    let student = null
    try {
      const studentProfile = await sql`
        SELECT sp.*, u.full_name
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ${userId}
      `
      student = studentProfile[0] ?? null
    } catch (profileError) {
      console.warn("Student profile fetch failed (continuing without):", profileError)
    }

    // Fetch all active games (is_active yoksa veya null ise COALESCE ile dahil et)
    let games: unknown[] = []
    try {
      const gamesResult = await sql`
        SELECT id, title, description, category, difficulty_level,
               target_disabilities, thumbnail_url, game_url,
               duration_minutes, is_active, created_at
        FROM games
        WHERE COALESCE(is_active, true) = true
        ORDER BY difficulty_level NULLS LAST, title
      `
      games = Array.isArray(gamesResult) ? gamesResult : []
    } catch (gamesError) {
      console.error("Failed to fetch games:", gamesError)
      return NextResponse.json({
        user,
        student,
        games: [],
        error: "Oyun listesi yüklenemedi",
      }, { status: 200 })
    }

    return NextResponse.json({
      user,
      student,
      games,
    })
  } catch (error) {
    console.error("Failed to fetch student games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}
