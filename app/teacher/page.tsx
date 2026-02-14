import { getCurrentUser, logout } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock, Brain, Plus, LogOut, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== "teacher") {
    redirect("/login")
  }

  const teacherId = Number(user.id)

  // Fetch teacher's students
  let students: Awaited<ReturnType<typeof sql>> = []
  try {
    students = await sql`
      SELECT u.id, u.full_name, u.avatar_url, sp.points, sp.level
      FROM teacher_students ts
      JOIN users u ON ts.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ts.teacher_id = ${teacherId}
      ORDER BY u.full_name
    `
  } catch {
    students = []
  }

  // Fetch recent activity across all students
  let recentActivity: Awaited<ReturnType<typeof sql>> = []
  try {
    recentActivity = await sql`
      SELECT gs.*, g.title, g.category, u.full_name as student_name
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      JOIN users u ON gs.student_id = u.id
      WHERE gs.student_id IN (
        SELECT student_id FROM teacher_students WHERE teacher_id = ${teacherId}
      )
      ORDER BY gs.started_at DESC
      LIMIT 10
    `
  } catch {
    recentActivity = []
  }

  // Fetch assignments
  let assignments: Awaited<ReturnType<typeof sql>> = []
  try {
    assignments = await sql`
      SELECT a.*, g.title as game_title, 
             (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
             (SELECT COUNT(*) FROM unnest(a.target_students) as student_id) as total_students
      FROM assignments a
      JOIN games g ON a.game_id = g.id
      WHERE a.teacher_id = ${teacherId}
      ORDER BY a.due_date DESC
      LIMIT 10
    `
  } catch {
    assignments = []
  }

  // Calculate stats
  const totalStudents = students.length
  const totalSessions = recentActivity.length
  const avgScore =
    recentActivity.length > 0
      ? Math.round(recentActivity.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / recentActivity.length)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-balance">Hoş geldiniz, {user.full_name}</h1>
            <p className="text-muted-foreground">Öğrencilerinizin ilerlemesini takip edin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
            >
              <Link href="/teacher/ai-analysis">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Analiz
              </Link>
            </Button>
            <Button asChild>
              <Link href="/teacher/assignments/new">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Görev
              </Link>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </form>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Aktif takip edilen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Son Aktivite</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Son oyun oturumu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Performans</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Sınıf ortalaması</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Öğrencilerim</CardTitle>
              <CardDescription>Toplam {totalStudents} öğrenci</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Henüz öğrenciniz yok</div>
              ) : (
                <div className="space-y-3">
                  {students.map((student: any) => (
                    <Link
                      key={student.id}
                      href={`/teacher/students/${student.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-sm text-muted-foreground">Seviye {student.level || 1}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{student.points || 0}</div>
                        <div className="text-xs text-muted-foreground">puan</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>Öğrencilerin son oyun oturumları</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Henüz aktivite yok</div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 6).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{activity.student_name}</div>
                          <div className="text-xs text-muted-foreground">{activity.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{activity.score || 0}</div>
                        <Badge variant={activity.completed_at != null ? "default" : "secondary"} className="text-xs">
                          {activity.completed_at != null ? "Tamamlandı" : "Devam Ediyor"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Verilen Görevler</CardTitle>
            <CardDescription>Son verilen görevler ve tamamlanma durumu</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Henüz görev verilmedi</div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground">{assignment.game_title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Son teslim: {new Date(assignment.due_date).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {assignment.submission_count || 0}/{assignment.total_students || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">tamamlandı</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
