import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Clock, Target, ArrowLeft, Play } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'student') {
    redirect('/login')
  }

  const { id } = await params
  const gameId = parseInt(id, 10)
  if (Number.isNaN(gameId)) {
    notFound()
  }
  
  // Fetch game details
  const games = await sql`
    SELECT * FROM games WHERE id = ${gameId}
  `
  
  if (games.length === 0) {
    notFound()
  }
  
  const game = games[0]
  const userId = Number(user.id)

  // Fetch student's previous sessions for this game
  const sessions = await sql`
    SELECT * FROM game_sessions
    WHERE student_id = ${userId} AND game_id = ${gameId}
    ORDER BY started_at DESC
    LIMIT 5
  `

  const bestScore = sessions.length > 0 
    ? Math.max(...sessions.map((s: any) => s.score || 0))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/student/games">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Oyunlara Dön
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <Brain className="w-24 h-24 text-primary/50" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-4">
                  <Badge variant="secondary">{game.difficulty_level}</Badge>
                  <Badge variant="outline">{game.category}</Badge>
                  {game.target_disabilities && game.target_disabilities.map((disability: string) => (
                    <Badge key={disability} variant="outline" className="text-xs">
                      {disability}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Öğrenme Hedefleri
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {game.learning_objectives && game.learning_objectives.map((objective: string, idx: number) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>

                {(game.instructions != null && game.instructions !== '') && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Nasıl Oynanır?</h3>
                    <p className="text-sm text-muted-foreground">{game.instructions}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Tahmini Süre: {game.duration_minutes ?? game.estimated_duration ?? 15} dakika
                </div>

                <Button asChild size="lg" className="w-full">
                  <Link href={`/student/games/${game.id}/play`}>
                    <Play className="w-5 h-5 mr-2" />
                    Oyunu Başlat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İstatistikleriniz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">En Yüksek Skor</div>
                  <div className="text-3xl font-bold text-primary">{bestScore}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Toplam Oturum</div>
                  <div className="text-2xl font-semibold">{sessions.length}</div>
                </div>
              </CardContent>
            </Card>

            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Son Performansınız</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessions.slice(0, 3).map((session: any, idx: number) => (
                      <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm text-muted-foreground">Oturum {idx + 1}</span>
                        <span className="font-semibold">{session.score || 0}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
