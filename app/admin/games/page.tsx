import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain } from 'lucide-react'
import Link from 'next/link'

export default async function GamesManagement() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // Fetch all games
  const games = await sql`
    SELECT * FROM games
    ORDER BY category, title
  `

  // Group by category
  const gamesByCategory = games.reduce((acc: any, game: any) => {
    const category = game.category || 'Diğer'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(game)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard'a Dön
          </Link>
        </Button>

        <header>
          <h1 className="text-3xl font-bold">Oyun Yönetimi</h1>
          <p className="text-muted-foreground">Platformdaki tüm oyunlar</p>
        </header>

        {Object.entries(gamesByCategory).map(([category, categoryGames]: [string, any]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{categoryGames.length} oyun</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryGames.map((game: any) => (
                  <Card key={game.id} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                      <Brain className="w-12 h-12 text-primary/50" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{game.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {game.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {game.estimated_duration} dk
                        </Badge>
                      </div>
                      {game.target_disabilities && game.target_disabilities.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {game.target_disabilities.map((disability: string) => (
                            <Badge key={disability} variant="outline" className="text-xs">
                              {disability}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
