import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  const assignments = await sql`
    SELECT a.*, g.title as game_title, g.category, u.full_name as teacher_name,
           EXISTS(SELECT 1 FROM assignment_submissions WHERE assignment_id = a.id AND student_id = ${user.id}) as is_completed
    FROM assignments a
    JOIN games g ON a.game_id = g.id
    JOIN users u ON a.teacher_id = u.id
    WHERE ${user.id} = ANY(a.target_students)
    ORDER BY a.due_date ASC, a.created_at DESC
  `

  const today = new Date().toISOString().split("T")[0]

  const pendingAssignments = assignments.filter((a: any) => !a.is_completed)
  const completedAssignments = assignments.filter((a: any) => a.is_completed)
  const overdueAssignments = assignments.filter((a: any) => !a.is_completed && new Date(a.due_date) < new Date(today))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Görevlerim</h1>
          <p className="text-muted-foreground">Öğretmenlerinizin verdiği görevleri görüntüleyin</p>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Görevler</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
              <AlertCircle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueAssignments.length}</div>
            </CardContent>
          </Card>
        </div>

        {overdueAssignments.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Gecikmiş Görevler</CardTitle>
              <CardDescription>Bu görevlerin son teslim tarihi geçmiş</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueAssignments.map((assignment: any) => (
                  <Card key={assignment.id} className="border-destructive/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </div>
                        <Badge variant="destructive">Gecikmiş</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {assignment.game_title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(assignment.due_date).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/student/games/${assignment.game_id}`}>Görevi Tamamla</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Görevler</CardTitle>
            <CardDescription>{pendingAssignments.length} görev tamamlanmayı bekliyor</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Harika! Şu an bekleyen göreviniz yok.</div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((assignment: any) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </div>
                        <Badge>{assignment.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {assignment.game_title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(assignment.due_date).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Öğretmen: {assignment.teacher_name}</p>
                      <Button asChild className="w-full">
                        <Link href={`/student/games/${assignment.game_id}`}>Göreve Başla</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {completedAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tamamlanan Görevler</CardTitle>
              <CardDescription>{completedAssignments.length} görev tamamlandı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAssignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-70"
                  >
                    <div>
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground">{assignment.game_title}</div>
                    </div>
                    <Badge variant="secondary">Tamamlandı</Badge>
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
