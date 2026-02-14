import { getCurrentUser, logout } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Trophy, Target, Sparkles, Clock, TrendingUp, LogOut, Library, BookCheck } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  const userId = Number(user.id)

  // Fetch student profile
  let profile: Awaited<ReturnType<typeof sql>>[0] | undefined
  try {
    const profiles = await sql`
      SELECT * FROM student_profiles WHERE user_id = ${userId}
    `
    profile = profiles[0]
  } catch {
    profile = undefined
  }

  // Fetch recent game sessions
  let recentSessions: Awaited<ReturnType<typeof sql>> = []
  try {
    recentSessions = await sql`
      SELECT gs.*, g.title, g.category, g.thumbnail_url
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.student_id = ${userId}
      ORDER BY gs.started_at DESC
      LIMIT 5
    `
  } catch {
    recentSessions = []
  }

  // Fetch recommended games (aktif oyunlar, sütun uyumlu)
  let recommendedGames: Awaited<ReturnType<typeof sql>> = []
  try {
    recommendedGames = await sql`
      SELECT id, title, description, category, difficulty_level,
             duration_minutes, target_disabilities, thumbnail_url, game_url
      FROM games
      WHERE COALESCE(is_active, true) = true
      ORDER BY id
      LIMIT 4
    `
  } catch {
    recommendedGames = []
  }

  const completedSessions = recentSessions.filter((s: any) => s.completed_at !== null).length
  const totalSessions = recentSessions.length
  const avgScore =
    recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / recentSessions.length)
      : 0

  const achievements = []
  if (profile?.points >= 100)
    achievements.push({ id: 1, name: "İlk 100 Puan", icon: "🎯", color: "bg-yellow-100 text-yellow-700" })
  if (profile?.points >= 500)
    achievements.push({ id: 2, name: "Süper Öğrenci", icon: "⭐", color: "bg-purple-100 text-purple-700" })
  if (profile?.level >= 5)
    achievements.push({ id: 3, name: "Seviye Ustası", icon: "🏆", color: "bg-blue-100 text-blue-700" })
  if (completedSessions >= 10)
    achievements.push({ id: 4, name: "10 Oyun Tamamladı", icon: "🎮", color: "bg-green-100 text-green-700" })
  if (completedSessions >= 50)
    achievements.push({ id: 5, name: "Oyun Kahramanı", icon: "💪", color: "bg-red-100 text-red-700" })
  if (avgScore >= 80)
    achievements.push({ id: 6, name: "Yüksek Performans", icon: "🔥", color: "bg-orange-100 text-orange-700" })

  const today = new Date().toISOString().split("T")[0]
  let todayProgress = 0
  try {
    const todaySessions = await sql`
      SELECT COUNT(*) as count FROM game_sessions 
      WHERE student_id = ${userId} 
      AND DATE(started_at) = ${today}
      AND completed_at IS NOT NULL
    `
    todayProgress = Number(todaySessions[0]?.count) || 0
  } catch {
    todayProgress = 0
  }
  const dailyGoal = 3

  let categoryStats: Awaited<ReturnType<typeof sql>> = []
  try {
    categoryStats = await sql`
      SELECT g.category, 
             COUNT(*) as total, 
             AVG(gs.score) as avg_score,
             SUM(CASE WHEN gs.completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.student_id = ${userId}
      GROUP BY g.category
    `
  } catch {
    categoryStats = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-balance">Merhaba, {user.full_name}!</h1>
            <p className="text-muted-foreground">Bugün hangi oyunu oynamak istersin?</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/student/games">
                <Library className="w-4 h-4 mr-2" />
                Oyun Kütüphanesi
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/student/assignments">
                <BookCheck className="w-4 h-4 mr-2" />
                Görevlerim
              </Link>
            </Button>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{profile?.points || 0}</div>
              <div className="text-xs text-muted-foreground">Puan</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <form action={logout}>
              <Button variant="outline" size="icon" type="submit" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Seviye</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.level || 1}</div>
              <Progress value={(profile?.points || 0) % 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Sonraki seviyeye {100 - ((profile?.points || 0) % 100)} puan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan Oyunlar</CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions}</div>
              <p className="text-xs text-muted-foreground mt-2">Toplam {totalSessions} oturum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Skor</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}</div>
              <p className="text-xs text-muted-foreground mt-2">Son 5 oyunda</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Günlük Hedef
            </CardTitle>
            <CardDescription>Bugün {dailyGoal} oyun tamamla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {todayProgress} / {dailyGoal} oyun
                </span>
                <span className="font-bold">{Math.round((todayProgress / dailyGoal) * 100)}%</span>
              </div>
              <Progress value={(todayProgress / dailyGoal) * 100} className="h-3" />
              {todayProgress >= dailyGoal && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Harika! Günlük hedefini tamamladın!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Senin İçin Önerilen Oyunlar
            </CardTitle>
            <CardDescription>Öğrenme stiline göre seçildi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedGames.map((game: any) => (
                <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-primary/50" />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{game.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {game.duration_minutes ?? game.estimated_duration ?? 15} dakika
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {game.difficulty_level == null ? "—" : game.difficulty_level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {game.category ?? "—"}
                      </Badge>
                    </div>
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/student/games/${game.id}/play`}>Oyna</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Kazanılan Rozetler
              </CardTitle>
              <CardDescription>Başarılarınızı görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`${achievement.color} rounded-lg p-4 text-center space-y-2 hover:scale-105 transition-transform`}
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="text-xs font-medium">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Son oynadığın oyunlar</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Henüz oyun oynamadınız. Hadi başlayalım!</div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{session.title}</div>
                        <div className="text-sm text-muted-foreground">{session.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{session.score || 0}</div>
                      <Badge variant={session.completed_at ? "default" : "secondary"} className="text-xs">
                        {session.completed_at ? "Tamamlandı" : "Devam Ediyor"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {categoryStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Kategori Performansı
              </CardTitle>
              <CardDescription>Her kategorideki başarı oranınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((stat: any) => (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{stat.category}</span>
                      <span className="text-muted-foreground">
                        {stat.completed}/{stat.total} tamamlandı - Ort: {Math.round(stat.avg_score || 0)}
                      </span>
                    </div>
                    <Progress value={(stat.completed / stat.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
