"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, Target } from "lucide-react"
import Link from "next/link"

interface StudentData {
  student: any
  sessions: any[]
  completedSessions: any[]
  avgScore: number
  playTimeMinutes: number
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/teacher/students/${params.id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            router.push("/login")
            throw new Error("Unauthorized")
          }
          throw new Error("Failed to fetch student data")
        }
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">Hata: {error || "Veri yüklenemedi"}</div>
          <Button asChild className="mt-4">
            <Link href="/teacher">Geri Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { student, sessions, completedSessions, avgScore, playTimeMinutes } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <Button asChild variant="ghost">
          <Link href="/teacher">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Link>
        </Button>

        {/* Student Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{student.full_name}</CardTitle>
                <CardDescription>{student.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>Seviye {student.level || 1}</Badge>
                  <Badge variant="outline">{student.grade_level || "Belirtilmemiş"}</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{student.points || 0}</div>
                <div className="text-sm text-muted-foreground">Toplam Puan</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan Oyunlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground">Toplam {sessions.length} oyun başlatıldı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Skor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Toplam Süre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playTimeMinutes}</div>
              <p className="text-xs text-muted-foreground">dakika</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sonraki Seviye</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{100 - ((student.points || 0) % 100)}</div>
              <Progress value={(student.points || 0) % 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Learning Profile */}
        {student.learning_disabilities && student.learning_disabilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Öğrenme Profili
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-2">Öğrenme Güçlükleri</div>
                <div className="flex gap-2 flex-wrap">
                  {student.learning_disabilities.map((disability: string) => (
                    <Badge key={disability} variant="secondary">
                      {disability}
                    </Badge>
                  ))}
                </div>
              </div>
              {student.learning_style && (
                <div>
                  <div className="text-sm font-medium mb-2">Öğrenme Stili</div>
                  <Badge variant="outline">{student.learning_style}</Badge>
                </div>
              )}
              {student.interests && student.interests.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">İlgi Alanları</div>
                  <div className="flex gap-2 flex-wrap">
                    {student.interests.map((interest: string) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Son Oyun Oturumları</CardTitle>
            <CardDescription>
              Toplam {sessions.length} oturum ({completedSessions.length} tamamlandı)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Henüz oyun oturumu yok</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: any) => {
                  const duration = session.time_spent_seconds || session.duration_seconds || 0
                  const isCompleted = session.completed_at !== null

                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{session.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.category} • {Math.round(duration / 60)} dakika
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isCompleted && session.completed_at
                              ? new Date(session.completed_at).toLocaleDateString("tr-TR")
                              : new Date(session.started_at).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{isCompleted ? session.score || 0 : "-"}</div>
                        <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs mt-1">
                          {isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
