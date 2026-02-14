import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // Fetch platform statistics
  const totalUsers = await sql`SELECT COUNT(*) as count FROM users`
  const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`
  const totalTeachers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`
  const totalGames = await sql`SELECT COUNT(*) as count FROM games`
  const totalSessions = await sql`SELECT COUNT(*) as count FROM game_sessions`
  const completedSessions = await sql`SELECT COUNT(*) as count FROM game_sessions WHERE status = 'completed'`

  // Recent activity
  const recentSessions = await sql`
    SELECT gs.*, g.title, u.full_name
    FROM game_sessions gs
    JOIN games g ON gs.game_id = g.id
    JOIN users u ON gs.student_id = u.id
    ORDER BY gs.started_at DESC
    LIMIT 10
  `

  const stats = {
    totalUsers: totalUsers[0].count,
    totalStudents: totalStudents[0].count,
    totalTeachers: totalTeachers[0].count,
    totalGames: totalGames[0].count,
    totalSessions: totalSessions[0].count,
    completedSessions: completedSessions[0].count,
  }

  const completionRate = stats.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform yönetimi ve istatistikleri</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/users">Kullanıcılar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/games">Oyunlar</Link>
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalStudents} öğrenci, {stats.totalTeachers} öğretmen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Oyun</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Eğitici oyun
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Oyun Oturumları</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedSessions} tamamlandı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Başarı oranı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Platform genelinde son oyun oturumları</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz aktivite yok
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{session.full_name}</div>
                        <div className="text-sm text-muted-foreground">{session.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{session.score || 0}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/users">
              <CardHeader>
                <CardTitle className="text-lg">Kullanıcı Yönetimi</CardTitle>
                <CardDescription>Öğrenci ve öğretmenleri yönetin</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/games">
              <CardHeader>
                <CardTitle className="text-lg">Oyun Yönetimi</CardTitle>
                <CardDescription>Oyunları ekleyin ve düzenleyin</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/reports">
              <CardHeader>
                <CardTitle className="text-lg">Raporlar</CardTitle>
                <CardDescription>Platform raporlarını görüntüleyin</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
