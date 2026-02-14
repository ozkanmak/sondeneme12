"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function NewAssignmentPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/teacher/assignment-data")
      const data = await res.json()
      setStudents(data.students)
      setGames(data.games)
    }
    loadData()
  }, [])

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      gameId: formData.get("gameId"),
      dueDate: formData.get("dueDate"),
      students: selectedStudents,
    }

    const res = await fetch("/api/teacher/assignments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push("/teacher")
    } else {
      alert("Görev oluşturulamadı")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/teacher">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Yeni Görev Oluştur</h1>
              <p className="text-muted-foreground">Öğrencilerinize oyun görevi atayın</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Görev Detayları</CardTitle>
              <CardDescription>Görev bilgilerini doldurun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Görev Başlığı</Label>
                  <Input id="title" name="title" placeholder="Örn: Haftalık Matematik Görevi" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Görev hakkında açıklama yazın..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gameId">Oyun Seç</Label>
                  <Select name="gameId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir oyun seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game: any) => (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          {game.title} ({game.category} - {game.difficulty_level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Teslim Tarihi</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Öğrenciler ({selectedStudents.length} seçildi)</Label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                    {students.map((student: any) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {student.full_name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={isSubmitting || selectedStudents.length === 0}>
                    {isSubmitting ? "Oluşturuluyor..." : "Görev Oluştur"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/teacher">İptal</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
