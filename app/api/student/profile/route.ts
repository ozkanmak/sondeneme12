import { sql } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT sp.level, sp.points, u.full_name, u.email
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.user_id = ${Number.parseInt(userId)}
    `

    if (result.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
