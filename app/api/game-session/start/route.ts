import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId } = await request.json()

    const result = await sql`
      INSERT INTO game_sessions (student_id, game_id, started_at)
      VALUES (${user.id}, ${gameId}, NOW())
      RETURNING id
    `

    return NextResponse.json({ sessionId: result[0].id })
  } catch (error) {
    console.error('[v0] Error starting game session:', error)
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}
