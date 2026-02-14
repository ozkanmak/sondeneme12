"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Clock,
  Gamepad2,
} from "lucide-react"
import Link from "next/link"

interface Student {
  id: number
  full_name: string
  level: number
  points: number
  learning_disabilities: string[]
}

interface GameSession {
  id: number
  game_id: number
  game_title: string
  category: string
  score: number | null
  time_spent_seconds: number | null
  completed_at: string | null
}

interface AnalysisResult {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  encouragement: string
}

export default function AIAnalysisPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [studentData, setStudentData] = useState<{ student: Student; sessions: GameSession[] } | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")

  // Fetch students list
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/teacher/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data.students || [])
        }
      } catch (err) {
        console.error("Failed to fetch students:", err)
      }
    }
    fetchStudents()
  }, [])

  // Fetch student data when selected
  useEffect(() => {
    if (!selectedStudent) {
      setStudentData(null)
      setAnalysis(null)
      return
    }

    async function fetchStudentData() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/teacher/students/${selectedStudent}/analysis`)
        if (res.ok) {
          const data = await res.json()
          setStudentData(data)
          setAnalysis(null)
        } else {
          setError("Öğrenci verileri yüklenemedi")
        }
      } catch (err) {
        setError("Bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    fetchStudentData()
  }, [selectedStudent])

  // Analyze with AI
  async function analyzeWithAI() {
    if (!studentData) return

    setAnalyzing(true)
    setError("")
    try {
      const res = await fetch("/api/teacher/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentData.student,
          sessions: studentData.sessions,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis)
      } else {
        setError("AI analizi yapılamadı")
      }
    } catch (err) {
      setError("AI analizi sırasında bir hata oluştu")
    } finally {
      setAnalyzing(false)
    }
  }

  const completedSessions = studentData?.sessions.filter((s) => s.completed_at) || []
  const totalSessions = studentData?.sessions.length || 0
  const avgScore =
    completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
      : 0
  const totalTime = studentData?.sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-500" />
              AI Öğrenci Analizi
            </h1>
            <p className="text-muted-foreground">
              Öğrencinin performansını AI ile analiz edin ve geliştirme önerileri alın
            </p>
          </div>
        </header>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Seçin</CardTitle>
            <CardDescription>Analiz edilecek öğrenciyi seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Bir öğrenci seçin..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.full_name} - Seviye {student.level || 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Öğrenci verileri yükleniyor...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6 text-center text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Student Data */}
        {studentData && !loading && (
          <>
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{studentData.student.full_name}</span>
                  <Badge variant="outline">Seviye {studentData.student.level || 1}</Badge>
                </CardTitle>
                <CardDescription>
                  {studentData.student.points || 0} puan | {totalSessions} oyun oturumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentData.student.learning_disabilities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {studentData.student.learning_disabilities.map((disability, i) => (
                      <Badge key={i} variant="secondary">
                        {disability}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      {completedSessions.length}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">Tamamlanan Oyun</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{avgScore}%</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Ortalama Başarı</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {Math.round(totalTime / 60)}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-400">Toplam Dakika</div>
                  </div>
                </div>

                {studentData.sessions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Son Oyun Oturumları</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {studentData.sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium text-sm">{session.game_title}</div>
                            <div className="text-xs text-muted-foreground">{session.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">
                              {session.score !== null ? `${session.score}%` : "Devam ediyor"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.time_spent_seconds ? `${Math.round(session.time_spent_seconds / 60)} dk` : "-"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <div className="mt-6">
                  <Button
                    onClick={analyzeWithAI}
                    disabled={analyzing || studentData.sessions.length === 0}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI ile Analiz Et
                      </>
                    )}
                  </Button>
                  {studentData.sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">Bu öğrencinin henüz oyun verisi bulunmuyor.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            {analysis && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Analiz Sonuçları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Genel Değerlendirme</h4>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5" />
                        Güçlü Yönler
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-1">+</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5" />
                        Geliştirilmesi Gereken Alanlar
                      </h4>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-500 mt-1">!</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5" />
                      Öğretmen İçin Öneriler
                    </h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Encouragement */}
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg text-center">
                    <p className="text-purple-700 dark:text-purple-300 italic">"{analysis.encouragement}"</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
