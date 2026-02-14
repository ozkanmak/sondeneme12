import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY ortam değişkeni tanımlı değil. Lütfen Vars bölümünden ekleyin.",
        },
        { status: 500 },
      )
    }

    const { student, sessions } = await request.json()

    if (!student || !sessions) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 })
    }

    // Calculate statistics
    const totalGames = sessions.length
    const completedGames = sessions.filter((s: any) => s.completed_at).length
    const avgScore =
      totalGames > 0 ? Math.round(sessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / totalGames) : 0

    // Group by category
    const categoryStats: Record<string, { score: number; count: number }> = {}
    for (const session of sessions) {
      const cat = session.category || "other"
      if (!categoryStats[cat]) {
        categoryStats[cat] = { score: 0, count: 0 }
      }
      categoryStats[cat].score += session.score || 0
      categoryStats[cat].count++
    }

    const categoryAnalysis = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      avgScore: stats.count > 0 ? Math.round(stats.score / stats.count) : 0,
      gamesPlayed: stats.count,
    }))

    // Build prompt for AI
    const prompt = `
Sen bir özel eğitim uzmanısın. Aşağıdaki öğrenci verilerini analiz et ve Türkçe olarak detaylı bir değerlendirme yap.

## Öğrenci Bilgileri:
- İsim: ${student.full_name}
- Seviye: ${student.level || 1}
- Toplam Puan: ${student.points || 0}
- Öğrenme Güçlükleri: ${student.learning_disabilities?.join(", ") || "Belirtilmemiş"}

## Performans İstatistikleri:
- Toplam Oyun: ${totalGames}
- Tamamlanan Oyun: ${completedGames}
- Ortalama Skor: ${avgScore}

## Kategori Bazlı Performans:
${categoryAnalysis.map((c) => `- ${c.category}: Ortalama ${c.avgScore} puan (${c.gamesPlayed} oyun)`).join("\n")}

## Son Oyun Detayları:
${sessions
  .slice(0, 10)
  .map(
    (s: any) =>
      `- ${s.game_title} (${s.category}): ${s.score || 0} puan, ${s.completed_at ? "Tamamlandı" : "Devam ediyor"}`,
  )
  .join("\n")}

Bu verilere dayanarak JSON formatında yanıt ver:
{
  "summary": "Öğrencinin genel performans özeti (2-3 cümle)",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
  "weaknesses": ["Geliştirilmesi gereken alan 1", "Geliştirilmesi gereken alan 2"],
  "recommendations": ["Öneri 1", "Öneri 2", "Öneri 3", "Öneri 4"],
  "encouragement": "Öğrenci için motivasyon mesajı"
}

Öğrencinin öğrenme güçlüklerini göz önünde bulundurarak, özel eğitim perspektifinden değerlendir.
Sadece JSON döndür, başka açıklama ekleme.
`

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir özel eğitim uzmanısın. Yanıtlarını her zaman geçerli JSON formatında ver.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content || ""

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("AI yanıtı JSON formatında değil")
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error("AI Analysis error:", error?.message || error)

    let errorMessage = "AI analizi yapılamadı"

    if (error?.message?.includes("API key")) {
      errorMessage = "Geçersiz OpenAI API key. Lütfen Vars bölümünden kontrol edin."
    } else if (error?.message?.includes("quota") || error?.message?.includes("billing")) {
      errorMessage = "OpenAI hesabınızda yeterli kredi yok."
    } else if (error?.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
