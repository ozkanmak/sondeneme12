"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Clock, Star, Filter, Home, Search, SortAsc, Grid3x3, List } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GameListItem } from "./GameListItem"

export default function GamesLibrary() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [allGames, setAllGames] = useState<any[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recommended")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/student/games")
        const data = await response.json()

        if (!response.ok) {
          setLoadError(data.error || "Oyunlar yüklenemedi")
          setAllGames([])
          setLoading(false)
          return
        }

        if (!data.user || data.user.role !== "student") {
          router.push("/login")
          return
        }

        setUser(data.user)
        setStudent(data.student ?? null)
        setAllGames(Array.isArray(data.games) ? data.games : [])
        setLoadError(data.error || null)
      } catch (error) {
        console.error("Failed to load games:", error)
        setLoadError("Oyunlar yüklenirken bir hata oluştu")
        setAllGames([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Oyunlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  const disabilities = student?.learning_disabilities || []

  // Recommended games based on student's disabilities
  const recommendedGames = allGames.filter(
    (game: any) =>
      game.target_disabilities &&
      game.target_disabilities.some((d: string) =>
        disabilities.some(
          (sd: string) => d.toLowerCase().includes(sd.toLowerCase()) || sd.toLowerCase().includes(d.toLowerCase()),
        ),
      ),
  )

  // Group by disability
  const gamesByDisability: Record<string, any[]> = {}
  disabilities.forEach((disability: string) => {
    gamesByDisability[disability] = allGames.filter(
      (game: any) =>
        game.target_disabilities &&
        game.target_disabilities.some(
          (d: string) =>
            d.toLowerCase().includes(disability.toLowerCase()) || disability.toLowerCase().includes(d.toLowerCase()),
        ),
    )
  })

  // Group by category
  const gamesByCategory = allGames.reduce((acc: any, game: any) => {
    const category = game.category || "Diğer"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(game)
    return acc
  }, {})

  const categoryNames: Record<string, string> = {
    reading: "Okuma",
    writing: "Yazma",
    math: "Matematik",
    attention: "Dikkat",
    memory: "Hafıza",
  }

  const disabilityNames: Record<string, string> = {
    disleksi: "Disleksi",
    dyslexia: "Disleksi",
    diskalkuli: "Diskalkuli",
    dyscalculia: "Diskalkuli",
    adhd: "ADHD",
    disgrafya: "Disgrafya",
    dysgraphia: "Disgrafya",
    autism: "Otizm",
  }

  const GameCard = ({ game }: { game: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center relative">
        <Brain className="w-12 h-12 text-primary/50" />
        {recommendedGames.some((g: any) => g.id === game.id) && (
          <div className="absolute top-2 right-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{game.title}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {game.duration_minutes || 15} dakika
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {game.difficulty_level === "kolay" ? "Kolay" : game.difficulty_level === "orta" ? "Orta" : "Zor"}
          </Badge>
          {game.target_disabilities &&
            game.target_disabilities.slice(0, 2).map((disability: string) => (
              <Badge key={disability} variant="outline" className="text-xs">
                {disabilityNames[disability.toLowerCase()] || disability}
              </Badge>
            ))}
        </div>
        <Button asChild className="w-full" size="sm">
          <Link href={`/student/games/${game.id}/play`}>Oyna</Link>
        </Button>
      </CardContent>
    </Card>
  )

  // Filter games based on search
  const filteredGames = allGames.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort games
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title)
    if (sortBy === "difficulty") {
      const diffOrder = { kolay: 1, orta: 2, zor: 3 }
      return (diffOrder[a.difficulty_level] || 0) - (diffOrder[b.difficulty_level] || 0)
    }
    if (sortBy === "duration") return (a.duration_minutes || 0) - (b.duration_minutes || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Oyun Kütüphanesi
              </h1>
              <p className="text-muted-foreground mt-1">{allGames.length} eğitici oyun seni bekliyor</p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/student">
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Link>
            </Button>
          </div>

          {/* Search and Filter Bar */}
          {loadError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              {loadError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Oyun ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Önerilen</SelectItem>
                <SelectItem value="title">İsme Göre</SelectItem>
                <SelectItem value="difficulty">Zorluğa Göre</SelectItem>
                <SelectItem value="duration">Süreye Göre</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Önerilen
            </TabsTrigger>
            <TabsTrigger value="disability" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Hastalık
            </TabsTrigger>
            <TabsTrigger value="category">Kategori</TabsTrigger>
            <TabsTrigger value="all">Tümü</TabsTrigger>
          </TabsList>

          {/* Recommended Games */}
          <TabsContent value="recommended" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Senin İçin Önerilen Oyunlar
                </CardTitle>
                <CardDescription>
                  {student?.learning_disabilities
                    ? `${disabilities.map((d: string) => disabilityNames[d.toLowerCase()] || d).join(", ")} için özel seçilmiş oyunlar`
                    : "Tüm öğrenciler için uygun oyunlar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendedGames.length > 0 ? (
                    recommendedGames.map((game: any) => <GameCard key={game.id} game={game} />)
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground py-8">Henüz önerilecek oyun yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games by Disability */}
          <TabsContent value="disability" className="space-y-4">
            {disabilities.length > 0 ? (
              disabilities.map((disability: string) => (
                <Card key={disability}>
                  <CardHeader>
                    <CardTitle>{disabilityNames[disability.toLowerCase()] || disability} İçin Oyunlar</CardTitle>
                    <CardDescription>{gamesByDisability[disability]?.length || 0} oyun</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {gamesByDisability[disability]?.map((game: any) => (
                        <GameCard key={game.id} game={game} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Profilinde belirtilmiş öğrenme güçlüğü bulunmuyor
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Games by Category */}
          <TabsContent value="category" className="space-y-4">
            {Object.entries(gamesByCategory).map(([category, categoryGames]: [string, any]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{categoryNames[category] || category}</CardTitle>
                  <CardDescription>{categoryGames.length} oyun</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryGames.map((game: any) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* All Games */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Tüm Oyunlar</CardTitle>
                <CardDescription>
                  {searchQuery ? `${sortedGames.length} sonuç bulundu` : `${allGames.length} oyun`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={
                    viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"
                  }
                >
                  {sortedGames.length > 0 ? (
                    sortedGames.map((game: any) =>
                      viewMode === "grid" ? (
                        <GameCard key={game.id} game={game} />
                      ) : (
                        <GameListItem key={game.id} game={game} />
                      ),
                    )
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aradığınız oyun bulunamadı</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
