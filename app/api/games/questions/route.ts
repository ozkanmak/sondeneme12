import { NextResponse } from "next/server"

const questionDatabase: Record<string, any[]> = {
  reading: [
    { question: 'Hangi harf "E" harfidir?', options: ["A", "E", "İ", "O"], correct: 1 },
    { question: 'Hangi kelime "EV" kelimesidir?', options: ["VE", "EV", "VE", "AV"], correct: 1 },
    { question: '"KEDI" kelimesinde kaç harf var?', options: ["3", "4", "5", "6"], correct: 1 },
    { question: "Hangi harf sesli harftir?", options: ["K", "M", "A", "T"], correct: 2 },
    { question: '"MASA" kelimesi kaç heceden oluşur?', options: ["1", "2", "3", "4"], correct: 1 },
    { question: "Hangi kelime doğru yazılmıştır?", options: ["KITAP", "KİTAP", "KTIAP", "KATIP"], correct: 0 },
    { question: '"OKUL" kelimesinin ilk harfi nedir?', options: ["K", "O", "U", "L"], correct: 1 },
    { question: "Hangi harf sessiz harftir?", options: ["A", "E", "İ", "M"], correct: 3 },
  ],
  math: [
    { question: "5 + 3 = ?", options: ["6", "7", "8", "9"], correct: 2 },
    { question: "10 - 4 = ?", options: ["5", "6", "7", "8"], correct: 1 },
    { question: "3 × 2 = ?", options: ["4", "5", "6", "7"], correct: 2 },
    { question: "12 ÷ 3 = ?", options: ["3", "4", "5", "6"], correct: 1 },
    { question: "7 + 8 = ?", options: ["14", "15", "16", "17"], correct: 1 },
    { question: "20 - 5 = ?", options: ["13", "14", "15", "16"], correct: 2 },
    { question: "4 × 3 = ?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "15 ÷ 5 = ?", options: ["2", "3", "4", "5"], correct: 1 },
    { question: "6 + 9 = ?", options: ["13", "14", "15", "16"], correct: 2 },
    { question: "18 - 7 = ?", options: ["9", "10", "11", "12"], correct: 2 },
  ],
  writing: [
    { question: "Hangi kelime doğru yazılmıştır?", options: ["KALEM", "KALAM", "KALEM", "KELAM"], correct: 0 },
    { question: '"masa" kelimesini büyük harfle yaz', options: ["masa", "MASA", "Masa", "mAsA"], correct: 1 },
    { question: "Hangi noktalama işareti cümle sonunda kullanılır?", options: [",", ".", "!", "?"], correct: 1 },
    { question: "Özel isimler nasıl yazılır?", options: ["küçük", "BÜYÜK", "Büyük", "kÜçÜk"], correct: 2 },
    { question: "Hangi kelimede büyük harf kullanılmalı?", options: ["ev", "masa", "türkiye", "kitap"], correct: 2 },
    { question: '"Anne" kelimesi kaç harften oluşur?', options: ["3", "4", "5", "6"], correct: 1 },
  ],
  memory: [
    { question: "Bu sayıları hatırla: 5, 8, 3. İlk sayı nedir?", options: ["3", "5", "8", "2"], correct: 1 },
    {
      question: "Bu renkleri hatırla: Kırmızı, Mavi, Yeşil. İkinci renk nedir?",
      options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
      correct: 1,
    },
    {
      question: "Bu kelimeleri hatırla: Kedi, Köpek, Kuş. Son kelime nedir?",
      options: ["Kedi", "Köpek", "Kuş", "Fare"],
      correct: 2,
    },
    {
      question: "Bu şekilleri hatırla: Üçgen, Kare, Daire. İlk şekil nedir?",
      options: ["Üçgen", "Kare", "Daire", "Dikdörtgen"],
      correct: 0,
    },
  ],
  attention: [
    { question: 'Kaç tane "A" harfi var: ABACADA', options: ["2", "3", "4", "5"], correct: 2 },
    { question: "Hangi sayı farklı: 2, 4, 6, 7, 8", options: ["2", "4", "6", "7"], correct: 3 },
    { question: "Hangi kelime farklı: Elma, Armut, Muz, Masa", options: ["Elma", "Armut", "Muz", "Masa"], correct: 3 },
    { question: "Şu dizide eksik sayı: 1, 2, _, 4, 5", options: ["2", "3", "4", "5"], correct: 1 },
    { question: "Hangi şekil tekrar ediyor: ○△□○", options: ["○", "△", "□", "Hepsi"], correct: 0 },
  ],
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "reading"
  const count = Number.parseInt(searchParams.get("count") || "10")

  const questions = questionDatabase[category] || questionDatabase.reading

  // Shuffle and return requested number of questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  return NextResponse.json({ questions: selected })
}
