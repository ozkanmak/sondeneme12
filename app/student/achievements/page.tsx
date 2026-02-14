import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Flame,
  Brain,
  BookOpen,
  Calculator,
  Timer,
  Medal,
  Heart,
  Sparkles,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default async function AchievementsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  const profiles = await sql`SELECT * FROM student_profiles WHERE user_id = ${user.id}`
  const profile = profiles[0]

  const sessions = await sql`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed
    FROM game_sessions
    WHERE student_id = ${user.id}
  `

  const categoryStats = await sql`
    SELECT g.category, 
           COUNT(DISTINCT gs.id) as games_played,
           AVG(gs.score) as avg_score,
           MAX(gs.score) as max_score
    FROM game_sessions gs
    JOIN games g ON g.id = gs.game_id
    WHERE gs.student_id = ${user.id} AND gs.completed_at IS NOT NULL
    GROUP BY g.category
  `

  const totalGames = Number.parseInt(sessions[0]?.completed || 0)
  const avgScore = await sql`
    SELECT AVG(score) as avg FROM game_sessions 
    WHERE student_id = ${user.id} AND completed_at IS NOT NULL
  `
  const averageScore = Math.round(avgScore[0]?.avg || 0)

  const perfectGames = await sql`
    SELECT COUNT(*) as perfect FROM game_sessions
    WHERE student_id = ${user.id} AND score = 100 AND completed_at IS NOT NULL
  `
  const perfectCount = Number.parseInt(perfectGames[0]?.perfect || 0)

  const streakData = await sql`
    SELECT DATE(completed_at) as play_date
    FROM game_sessions
    WHERE student_id = ${user.id} AND completed_at IS NOT NULL
    ORDER BY completed_at DESC
    LIMIT 30
  `

  let currentStreak = 0
  if (streakData.length > 0) {
    const today = new Date().toISOString().split("T")[0]
    const checkDate = new Date()
    for (let i = 0; i < streakData.length; i++) {
      const playDate = new Date(streakData[i].play_date).toISOString().split("T")[0]
      const expectedDate = checkDate.toISOString().split("T")[0]
      if (playDate === expectedDate) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  const mathGames = categoryStats.find((s) => s.category === "math")?.games_played || 0
  const readingGames = categoryStats.find((s) => s.category === "reading")?.games_played || 0
  const writingGames = categoryStats.find((s) => s.category === "writing")?.games_played || 0
  const memoryGames = categoryStats.find((s) => s.category === "memory")?.games_played || 0
  const attentionGames = categoryStats.find((s) => s.category === "attention")?.games_played || 0

  const achievementCategories = {
    genel: [
      {
        id: 1,
        name: "İlk Adım",
        description: "İlk oyununu tamamla",
        icon: <Star className="w-8 h-8" />,
        requirement: 1,
        current: totalGames,
        unlocked: totalGames >= 1,
        tier: "bronz",
        points: 10,
      },
      {
        id: 2,
        name: "Yeni Başlayan",
        description: "5 oyun tamamla",
        icon: <Target className="w-8 h-8" />,
        requirement: 5,
        current: totalGames,
        unlocked: totalGames >= 5,
        tier: "bronz",
        points: 20,
      },
      {
        id: 3,
        name: "Oyun Tutkunu",
        description: "10 oyun tamamla",
        icon: <Zap className="w-8 h-8" />,
        requirement: 10,
        current: totalGames,
        unlocked: totalGames >= 10,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 4,
        name: "Deneyimli Oyuncu",
        description: "25 oyun tamamla",
        icon: <Medal className="w-8 h-8" />,
        requirement: 25,
        current: totalGames,
        unlocked: totalGames >= 25,
        tier: "gümüş",
        points: 100,
      },
      {
        id: 5,
        name: "Süper Oyuncu",
        description: "50 oyun tamamla",
        icon: <Crown className="w-8 h-8" />,
        requirement: 50,
        current: totalGames,
        unlocked: totalGames >= 50,
        tier: "altın",
        points: 200,
      },
      {
        id: 6,
        name: "Efsane Oyuncu",
        description: "100 oyun tamamla",
        icon: <Sparkles className="w-8 h-8" />,
        requirement: 100,
        current: totalGames,
        unlocked: totalGames >= 100,
        tier: "platin",
        points: 500,
      },
    ],
    puan: [
      {
        id: 7,
        name: "İlk Puanlar",
        description: "50 puan kazan",
        icon: <Trophy className="w-8 h-8" />,
        requirement: 50,
        current: profile?.points || 0,
        unlocked: (profile?.points || 0) >= 50,
        tier: "bronz",
        points: 10,
      },
      {
        id: 8,
        name: "Puan Avcısı",
        description: "100 puan kazan",
        icon: <Trophy className="w-8 h-8" />,
        requirement: 100,
        current: profile?.points || 0,
        unlocked: (profile?.points || 0) >= 100,
        tier: "bronz",
        points: 20,
      },
      {
        id: 9,
        name: "Puan Ustası",
        description: "250 puan kazan",
        icon: <Award className="w-8 h-8" />,
        requirement: 250,
        current: profile?.points || 0,
        unlocked: (profile?.points || 0) >= 250,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 10,
        name: "Puan Kralı",
        description: "500 puan kazan",
        icon: <Crown className="w-8 h-8" />,
        requirement: 500,
        current: profile?.points || 0,
        unlocked: (profile?.points || 0) >= 500,
        tier: "altın",
        points: 100,
      },
      {
        id: 11,
        name: "Puan Efsanesi",
        description: "1000 puan kazan",
        icon: <Sparkles className="w-8 h-8" />,
        requirement: 1000,
        current: profile?.points || 0,
        unlocked: (profile?.points || 0) >= 1000,
        tier: "platin",
        points: 250,
      },
    ],
    performans: [
      {
        id: 12,
        name: "İyi Başlangıç",
        description: "Ortalama 60 puan üstü",
        icon: <Target className="w-8 h-8" />,
        requirement: 60,
        current: averageScore,
        unlocked: averageScore >= 60,
        tier: "bronz",
        points: 30,
      },
      {
        id: 13,
        name: "İyi Performans",
        description: "Ortalama 70 puan üstü",
        icon: <Medal className="w-8 h-8" />,
        requirement: 70,
        current: averageScore,
        unlocked: averageScore >= 70,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 14,
        name: "Yüksek Performans",
        description: "Ortalama 80 puan üstü",
        icon: <Award className="w-8 h-8" />,
        requirement: 80,
        current: averageScore,
        unlocked: averageScore >= 80,
        tier: "altın",
        points: 100,
      },
      {
        id: 15,
        name: "Mükemmellik",
        description: "Ortalama 90 puan üstü",
        icon: <Crown className="w-8 h-8" />,
        requirement: 90,
        current: averageScore,
        unlocked: averageScore >= 90,
        tier: "platin",
        points: 200,
      },
      {
        id: 16,
        name: "İlk Mükemmel Oyun",
        description: "Bir oyunda 100 puan al",
        icon: <Star className="w-8 h-8" />,
        requirement: 1,
        current: perfectCount,
        unlocked: perfectCount >= 1,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 17,
        name: "Mükemmel Seri",
        description: "5 oyunda 100 puan al",
        icon: <Sparkles className="w-8 h-8" />,
        requirement: 5,
        current: perfectCount,
        unlocked: perfectCount >= 5,
        tier: "altın",
        points: 150,
      },
    ],
    kategori: [
      {
        id: 18,
        name: "Matematik Başlangıcı",
        description: "5 matematik oyunu tamamla",
        icon: <Calculator className="w-8 h-8" />,
        requirement: 5,
        current: mathGames,
        unlocked: mathGames >= 5,
        tier: "bronz",
        points: 30,
      },
      {
        id: 19,
        name: "Matematik Ustası",
        description: "20 matematik oyunu tamamla",
        icon: <Calculator className="w-8 h-8" />,
        requirement: 20,
        current: mathGames,
        unlocked: mathGames >= 20,
        tier: "altın",
        points: 100,
      },
      {
        id: 20,
        name: "Okuma Başlangıcı",
        description: "5 okuma oyunu tamamla",
        icon: <BookOpen className="w-8 h-8" />,
        requirement: 5,
        current: readingGames,
        unlocked: readingGames >= 5,
        tier: "bronz",
        points: 30,
      },
      {
        id: 21,
        name: "Okuma Ustası",
        description: "20 okuma oyunu tamamla",
        icon: <BookOpen className="w-8 h-8" />,
        requirement: 20,
        current: readingGames,
        unlocked: readingGames >= 20,
        tier: "altın",
        points: 100,
      },
      {
        id: 22,
        name: "Yazı Başlangıcı",
        description: "5 yazma oyunu tamamla",
        icon: <BookOpen className="w-8 h-8" />,
        requirement: 5,
        current: writingGames,
        unlocked: writingGames >= 5,
        tier: "bronz",
        points: 30,
      },
      {
        id: 23,
        name: "Hafıza Ustası",
        description: "10 hafıza oyunu tamamla",
        icon: <Brain className="w-8 h-8" />,
        requirement: 10,
        current: memoryGames,
        unlocked: memoryGames >= 10,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 24,
        name: "Dikkat Kahramanı",
        description: "10 dikkat oyunu tamamla",
        icon: <Target className="w-8 h-8" />,
        requirement: 10,
        current: attentionGames,
        unlocked: attentionGames >= 10,
        tier: "gümüş",
        points: 50,
      },
    ],
    ozel: [
      {
        id: 25,
        name: "Hızlı Düşünür",
        description: "2 dakikadan kısa sürede oyun bitir",
        icon: <Timer className="w-8 h-8" />,
        requirement: 1,
        current: 0, // Bu bir placeholder - gerçek hızlı oyun sayısı
        unlocked: false,
        tier: "gümüş",
        points: 50,
      },
      {
        id: 26,
        name: "Sabırlı Öğrenci",
        description: "3 gün üst üste oyun oyna",
        icon: <Flame className="w-8 h-8" />,
        requirement: 3,
        current: currentStreak,
        unlocked: currentStreak >= 3,
        tier: "gümüş",
        points: 75,
      },
      {
        id: 27,
        name: "Adanmış Öğrenci",
        description: "7 gün üst üste oyun oyna",
        icon: <Flame className="w-8 h-8" />,
        requirement: 7,
        current: currentStreak,
        unlocked: currentStreak >= 7,
        tier: "altın",
        points: 150,
      },
      {
        id: 28,
        name: "Vazgeçmez Kahraman",
        description: "30 gün üst üste oyun oyna",
        icon: <Heart className="w-8 h-8" />,
        requirement: 30,
        current: currentStreak,
        unlocked: currentStreak >= 30,
        tier: "platin",
        points: 500,
      },
    ],
  }

  const allAchievements = [
    ...achievementCategories.genel,
    ...achievementCategories.puan,
    ...achievementCategories.performans,
    ...achievementCategories.kategori,
    ...achievementCategories.ozel,
  ]

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length
  const totalPoints = allAchievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronz":
        return "from-orange-300 to-orange-100 border-orange-400"
      case "gümüş":
        return "from-gray-300 to-gray-100 border-gray-400"
      case "altın":
        return "from-yellow-300 to-yellow-100 border-yellow-500"
      case "platin":
        return "from-purple-300 to-purple-100 border-purple-500"
      default:
        return "from-gray-200 to-gray-100"
    }
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      bronz: "bg-orange-500",
      gümüş: "bg-gray-500",
      altın: "bg-yellow-500",
      platin: "bg-purple-500",
    }
    return <Badge className={`${colors[tier as keyof typeof colors]} text-white text-xs uppercase`}>{tier}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Rozetler</CardTitle>
              <CardDescription className="text-blue-100">Kazanılan başarılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">
                {unlockedCount}
                <span className="text-2xl">/{allAchievements.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Rozet Puanı</CardTitle>
              <CardDescription className="text-purple-100">Toplam kazanılan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Aktif Seri</CardTitle>
              <CardDescription className="text-orange-100">Üst üste gün</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold flex items-center gap-2">
                <Flame className="w-12 h-12" />
                {currentStreak}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="genel" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="genel">Genel</TabsTrigger>
            <TabsTrigger value="puan">Puan</TabsTrigger>
            <TabsTrigger value="performans">Performans</TabsTrigger>
            <TabsTrigger value="kategori">Kategori</TabsTrigger>
            <TabsTrigger value="ozel">Özel</TabsTrigger>
          </TabsList>

          {Object.entries(achievementCategories).map(([key, achievements]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${getTierColor(achievement.tier)} border-2`
                        : "bg-gray-100 dark:bg-gray-800 opacity-60"
                    } transition-all hover:scale-105 hover:shadow-lg`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={achievement.unlocked ? "text-gray-800" : "opacity-30"}>{achievement.icon}</div>
                        <div className="flex gap-2">
                          {achievement.unlocked && getTierBadge(achievement.tier)}
                          {achievement.unlocked && <Trophy className="w-6 h-6 text-yellow-600" />}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <CardDescription className="text-sm">{achievement.description}</CardDescription>
                      {achievement.unlocked && (
                        <div className="text-xs font-bold text-green-700">+{achievement.points} Rozet Puanı</div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>İlerleme</span>
                          <span className="font-bold">
                            {Math.min(achievement.current, achievement.requirement)}/{achievement.requirement}
                          </span>
                        </div>
                        <Progress value={(achievement.current / achievement.requirement) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
