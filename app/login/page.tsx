"use client"

import type React from "react"

import { useState } from "react"
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { BookOpen, Brain, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else if (result.success && result.role) {
        // Use window.location for immediate redirect
        if (result.role === "student") {
          window.location.href = "/student"
        } else if (result.role === "teacher") {
          window.location.href = "/teacher"
        } else if (result.role === "admin") {
          window.location.href = "/admin"
        }
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Giriş yapılırken bir hata oluştu")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">Öğrenme Platformu</h1>
          <p className="text-muted-foreground text-pretty">Her öğrenci özel. Her başarı değerli.</p>
        </div>

        {/* Login card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Hesabınıza giriş yaparak öğrenmeye devam edin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-sm text-muted-foreground text-center">Demo Hesaplar:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Öğrenci: ahmet@ogrenci.com / test123</p>
                <p>• Öğrenci 2: ogrenci@test.com / test123</p>
                <p>• Öğretmen: ogretmen@test.com / test123</p>
                <p>• Admin: admin@egitim.com / test123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">AI destekli kişiselleştirilmiş öğrenme deneyimi</p>
      </div>
    </div>
  )
}
