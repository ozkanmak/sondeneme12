import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, score, duration } = await request.json()

    await sql`
      UPDATE game_sessions
      SET completed_at = NOW(),
          time_spent_seconds = ${duration},
          score = ${score}
      WHERE id = ${sessionId} AND student_id = ${user.id}
    `

    const earnedPoints = score
    
    try {
      // Get current points and level
      const profiles = await sql`
        SELECT points, level FROM student_profiles
        WHERE user_id = ${user.id}
      `
      
      if (profiles.length > 0) {
        const currentPoints = profiles[0].points || 0
        const currentLevel = profiles[0].level || 1
        const newPoints = currentPoints + earnedPoints
        const newLevel = Math.floor(newPoints / 100) + 1
        
        await sql`
          UPDATE student_profiles
          SET points = ${newPoints},
              level = ${newLevel},
              updated_at = NOW()
          WHERE user_id = ${user.id}
        `
        
        return NextResponse.json({ 
          success: true, 
          earnedPoints,
          newPoints,
          newLevel,
          leveledUp: newLevel > currentLevel
        })
      }
    } catch (profileError) {
      console.error('[v0] Student profile update failed:', profileError)
    }

    return NextResponse.json({ success: true, earnedPoints })
  } catch (error) {
    console.error('[v0] Error completing game session:', error)
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
  }
}
