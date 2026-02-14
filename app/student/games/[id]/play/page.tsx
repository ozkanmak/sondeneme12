"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, ArrowLeft, Brain, Zap, Target, Heart, Sparkles, Clock } from "lucide-react" // Import SpeakerIcon
import Link from "next/link"
import { getProfile } from "@/lib/student-api"

// Declare webkitSpeechRecognition, SpeechRecognitionEvent, and SpeechRecognitionErrorEvent
declare var webkitSpeechRecognition: any
declare type SpeechRecognitionEvent = any
declare type SpeechRecognitionErrorEvent = any

// Define the Game interface
interface Game {
  id: number
  title: string
  category: string
  difficulty_level: string
  // Add other properties of Game as needed
}

interface Question {
  question: string
  options: string[]
  correct: number
  points: number
  hint?: string
  type?: "multiple-choice" | "memory-cards" | "color-match" | "sequence" | "rhythm" | "audio-letter" | "letter-detective"
  items?: string[] // For memory games
  colors?: string[] // For color games
  sequence?: number[] // For sequence games
  scrambled?: string[] // For letter detective games
  answer?: string // For letter detective games
}

// Placeholder for getQuestions function, assuming it's imported or defined elsewhere
// For the purpose of this merge, we'll define a dummy function if it's not found.
// In a real scenario, ensure this function is correctly imported or defined.
const getQuestions = (category: string, difficulty: string, level: number): Question[] => {
  console.warn("Using placeholder getQuestions function.")
  // Dummy implementation
  return [
    { question: "Dummy Question 1", options: ["A", "B", "C"], correct: 0, points: 10 },
    { question: "Dummy Question 2", options: ["X", "Y", "Z"], correct: 1, points: 15 },
  ]
}

export default function GamePlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // Renamed from currentQuestion
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null)
  const [studentLevel, setStudentLevel] = useState(1)
  const [answered, setAnswered] = useState(false) // New state for tracking if an answer is given
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null) // New state for selected answer
  const [feedback, setFeedback] = useState<string | null>(null) // New state for feedback message
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null) // New state for feedback type
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [isPreviewingCards, setIsPreviewingCards] = useState(false)
  const [previewCountdown, setPreviewCountdown] = useState(10)
  const [sequenceToMatch, setSequenceToMatch] = useState<string[]>([])
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false) // For Web Speech API

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [showResult, setShowResult] = useState(false) // State to control when to show correct/incorrect feedback for answers

  const [audioGameStarted, setAudioGameStarted] = useState(false)
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const getGameSpecificQuestions = (gameId: number, level: number): Question[] => {
    const games: Record<number, Question[]> = {
      // Harf Dedektifi (ID 1) - Karışık harflerden doğru kelimeyi oluşturma
      1: [
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["ARABA", "ABARA", "RAABA", "BAARA"],
          correct: 0,
          points: 15,
          type: "letter-detective",
          scrambled: ["R", "A", "A", "B", "A"],
          answer: "ARABA",
          hint: "Yolda gider, tekerlekleri vardır",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["ELMA", "MELA", "LEMA", "AMLE"],
          correct: 0,
          points: 15,
          type: "letter-detective",
          scrambled: ["L", "E", "A", "M"],
          answer: "ELMA",
          hint: "Kırmızı veya yeşil bir meyvedir",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["MASA", "SAMA", "AMAS", "MASA"],
          correct: 0,
          points: 15,
          type: "letter-detective",
          scrambled: ["A", "M", "S", "A"],
          answer: "MASA",
          hint: "Üzerine yemek koyarsın",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["KAPI", "PAKI", "IKAP", "APIK"],
          correct: 0,
          points: 15,
          type: "letter-detective",
          scrambled: ["P", "A", "K", "I"],
          answer: "KAPI",
          hint: "Eve girerken açarsın",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["OKUL", "LOKU", "UKOL", "KOLU"],
          correct: 0,
          points: 20,
          type: "letter-detective",
          scrambled: ["K", "U", "O", "L"],
          answer: "OKUL",
          hint: "Her gün ders gordugun yer",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["KALEM", "MEKAL", "LEMAK", "KAEML"],
          correct: 0,
          points: 20,
          type: "letter-detective",
          scrambled: ["E", "K", "L", "A", "M"],
          answer: "KALEM",
          hint: "Yazı yazmak icin kullanırsın",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["KITAP", "TAPIK", "PIKTA", "TIPAK"],
          correct: 0,
          points: 20,
          type: "letter-detective",
          scrambled: ["T", "K", "A", "I", "P"],
          answer: "KITAP",
          hint: "Okumanın en guzel yolu",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["BAHCE", "HEBAC", "CABEH", "EHBAC"],
          correct: 0,
          points: 25,
          type: "letter-detective",
          scrambled: ["H", "B", "E", "A", "C"],
          answer: "BAHCE",
          hint: "Ciceklerin yetistigi yer",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["PENCERE", "RECEPENP", "CERPENE", "NEPEREC"],
          correct: 0,
          points: 25,
          type: "letter-detective",
          scrambled: ["C", "P", "E", "E", "N", "R", "E"],
          answer: "PENCERE",
          hint: "Dışarıyı gordugun cam",
        },
        {
          question: "Bu harflerden hangi kelimeyi oluşturabilirsin?",
          options: ["DEFTER", "TERDEF", "FETDER", "REDEFT"],
          correct: 0,
          points: 25,
          type: "letter-detective",
          scrambled: ["F", "D", "T", "E", "E", "R"],
          answer: "DEFTER",
          hint: "Ders notlarını yazarsın",
        },
      ],

      // Hafıza Kahramanı - Sadece hafıza kartları ve eşleştirme
      5: [
        {
          question: "Kartları eşleştir! Aynı emojileri bul",
          options: ["🐶", "🐱", "🐶", "🐱"],
          correct: 0,
          points: 15,
          type: "memory-cards",
          items: ["🐶", "🐱", "🐭", "🐹", "🐶", "🐱", "🐭", "🐹"],
        },
        {
          question: "Hangi meyve çiftini gordün?",
          options: ["🍎🍎", "🍌🍌", "🍇🍇", "🍊🍊"],
          correct: 0,
          points: 15,
          type: "memory-cards",
          items: ["🍎", "🍌", "🍎", "🍌", "🍇", "🍊", "🍇", "🍊"],
        },
        {
          question: "Sayı çiftlerini eşleştir",
          options: ["1-1", "2-2", "3-3", "4-4"],
          correct: 0,
          points: 20,
          type: "memory-cards",
          items: ["1", "2", "3", "1", "2", "3", "4", "4"],
        },
        {
          question: "Renk kartlarını eşleştir",
          options: ["🔴🔴", "🔵🔵", "🟢🟢", "🟡🟡"],
          correct: 0,
          points: 20,
          type: "memory-cards",
          items: ["🔴", "🔵", "🟢", "🟡", "🔴", "🔵", "🟢", "🟡"],
        },
        {
          question: "Hayvan çiftlerini bul",
          options: ["🐕🐕", "🐈🐈", "🐇🐇", "🐘🐘"],
          correct: 0,
          points: 25,
          type: "memory-cards",
          items: ["🐕", "🐈", "🐇", "🐘", "🐕", "🐈", "🐇", "🐘"],
        },
        {
          question: "Şekil eşleştirme",
          options: ["⭐⭐", "❤️❤️", "⚽⚽", "🌟🌟"],
          correct: 0,
          points: 25,
          type: "memory-cards",
          items: ["⭐", "❤️", "⚽", "🌟", "⭐", "❤️", "⚽", "🌟"],
        },
        {
          question: "Harf çiftlerini eşleştir",
          options: ["A-A", "B-B", "C-C", "D-D"],
          correct: 0,
          points: 30,
          type: "memory-cards",
          items: ["A", "B", "C", "D", "A", "B", "C", "D"],
        },
        {
          question: "Karmaşık hafıza - 5 çift",
          options: ["Başla"],
          correct: 0,
          points: 35,
          type: "memory-cards",
          items: ["🎨", "🎭", "🎪", "🎬", "🎤", "🎨", "🎭", "🎪", "🎬", "🎤"],
        },
      ],

      // Renk Patlaması - Sadece renk seçimi ve hızlı tepki
      18: [
        // ID changed from 20 to 18 to match the 'ADHD - Dikkat/Hız' category
        {
          question: "KIRMIZI renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 0,
          points: 10,
          type: "color-match",
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "MAVİ renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 1,
          points: 10,
          type: "color-match",
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "YEŞİL renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 2,
          points: 10,
          type: "color-match",
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "SARI renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 3,
          points: 10,
          type: "color-match",
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "MOR renge tıkla!",
          options: ["Kırmızı", "Mavi", "Mor", "Turuncu"],
          correct: 2,
          points: 15,
          type: "color-match",
          colors: ["bg-red-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"],
        },
        {
          question: "TURUNCU renge tıkla!",
          options: ["Sarı", "Mavi", "Mor", "Turuncu"],
          correct: 3,
          points: 15,
          type: "color-match",
          colors: ["bg-yellow-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"],
        },
        {
          question: "PEMBE renge tıkla!",
          options: ["Pembe", "Mor", "Kırmızı", "Turuncu"],
          correct: 0,
          points: 20,
          type: "color-match",
          colors: ["bg-pink-500", "bg-purple-500", "bg-red-500", "bg-orange-500"],
        },
        {
          question: "KAHVERENGİ renge tıkla!",
          options: ["Turuncu", "Kahverengi", "Kırmızı", "Mor"],
          correct: 1,
          points: 20,
          type: "color-match",
          colors: ["bg-orange-500", "bg-amber-700", "bg-red-500", "bg-purple-500"],
        },
        {
          question: "GRİ renge tıkla!",
          options: ["Siyah", "Gri", "Beyaz", "Mavi"],
          correct: 1,
          points: 25,
          type: "color-match",
          colors: ["bg-black", "bg-gray-500", "bg-white border border-gray-300", "bg-blue-500"],
        },
        {
          question: "AÇIK MAVİ renge tıkla!",
          options: ["Mavi", "Açık Mavi", "Mor", "Yeşil"],
          correct: 1,
          points: 25,
          type: "color-match",
          colors: ["bg-blue-700", "bg-cyan-400", "bg-purple-500", "bg-green-500"],
        },
      ],

      // Simon Der Ki - Sıra takibi oyunu
      21: [
        // ID changed from 21 to 19 to match the 'ADHD - Sıra Takibi' category
        {
          question: "Sırayı tekrarla: 1-2-3",
          options: ["1-2-3", "3-2-1", "2-1-3", "1-3-2"],
          correct: 0,
          points: 15,
          type: "sequence",
          sequence: [1, 2, 3],
          items: ["1", "2", "3"],
        },
        {
          question: "Sırayı tekrarla: 2-4-1-3",
          options: ["2-4-1-3", "1-2-3-4", "4-3-2-1", "3-1-4-2"],
          correct: 0,
          points: 20,
          type: "sequence",
          sequence: [2, 4, 1, 3],
          items: ["2", "4", "1", "3"],
        },
        {
          question: "Sırayı tekrarla: 🔴-🔵-🟢",
          options: ["🔴-🔵-🟢", "🟢-🔵-🔴", "🔵-🔴-🟢", "🔴-🟢-🔵"],
          correct: 0,
          points: 20,
          type: "sequence",
          items: ["🔴", "🔵", "🟢"],
        },
        {
          question: "Sırayı tekrarla: A-C-B-D",
          options: ["A-C-B-D", "A-B-C-D", "D-C-B-A", "B-D-A-C"],
          correct: 0,
          points: 25,
          type: "sequence",
          items: ["A", "C", "B", "D"],
        },
        {
          question: "Karmaşık sıra: 3-1-4-2-5",
          options: ["3-1-4-2-5", "1-2-3-4-5", "5-4-3-2-1", "2-4-1-3-5"],
          correct: 0,
          points: 30,
          type: "sequence",
          items: ["3", "1", "4", "2", "5"],
        },
      ],

      // Ritim Ustası - Ritim ve zamanlama
      24: [
        // ID changed from 24 to 22 to match the 'ADHD - Zamanlama' category
        {
          question: "Ritmi takip et: TAK-TAK-TOK",
          options: ["TAK-TAK-TOK", "TOK-TAK-TAK", "TAK-TOK-TAK", "TOK-TOK-TAK"],
          correct: 0,
          points: 15,
          type: "rhythm",
        },
        {
          question: "Ritmi tamamla: 👏-👏-?",
          options: ["👏", "🤚", "✋", "🙌"],
          correct: 0,
          points: 15,
          type: "rhythm",
        },
        { question: "Desen: ⭐-❤️-⭐-❤️-?", options: ["⭐", "❤️", "💙", "🌟"], correct: 0, points: 20, type: "rhythm" },
        { question: "Hızlı ritim: 1-2-1-2-?", options: ["1", "2", "3", "4"], correct: 0, points: 25, type: "rhythm" },
      ],

      // Dikkat Merkezi - Farklı bulma ve odaklanma
      4: [
        {
          question: "Farklı olanı bul: 🍎🍎🍊🍎",
          options: ["1. sıra", "2. sıra", "3. sıra", "4. sıra"],
          correct: 2,
          points: 10,
        },
        { question: "Kaç tane ⭐ var? ⭐🌟⭐⭐🌟", options: ["2", "3", "4", "5"], correct: 1, points: 15 },
        {
          question: "Aynı olanları say: 🔴🔵🔴🔴🔵",
          options: ["🔴:2 🔵:3", "🔴:3 🔵:2", "🔴:4 🔵:1", "🔴:1 🔵:4"],
          correct: 1,
          points: 20,
        },
      ],

      // Farklı Bul Pro - Gelişmiş farklılık bulma
      22: [
        // ID changed from 22 to 20 to match the 'ADHD - Görsel Tarama' category
        {
          question: "İki grup arasında kaç fark var? 🐶🐱🐭 vs 🐶🐰🐭",
          options: ["1 fark", "2 fark", "3 fark", "Fark yok"],
          correct: 0,
          points: 20,
        },
        {
          question: "Hangi sırada farklı? AAABAAA",
          options: ["3. sıra", "4. sıra", "5. sıra", "6. sıra"],
          correct: 1,
          points: 25,
        },
        { question: "Deseni tamamla: 🔺🔻🔺?", options: ["🔺", "🔻", "🔶", "◆"], correct: 1, points: 30 },
      ],

      // Odak Tüneli - Dikkat dağıtıcıları görmezden gelme
      23: [
        // ID changed from 23 to 21 to match the 'ADHD - Odaklanma' category
        {
          question: "Sadece KIRMIZI noktalara odaklan. Kaç tane? 🔴ABC🔴XYZ🔴",
          options: ["2", "3", "4", "5"],
          correct: 1,
          points: 20,
        },
        { question: "Sadece sayıları say: A1B2C3D", options: ["2", "3", "4", "5"], correct: 1, points: 25 },
        { question: "Hedef: ⭐ Kaç tane? ❤️⭐💙⭐🟢⭐💜", options: ["2", "3", "4", "5"], correct: 1, points: 30 },
      ],

      // Ses Avcısı (Disleksi - Ses/Harf Eşleştirme)
      9: [
        {
          question: "'A' sesi hangi kelimede var?",
          options: ["KİTAP", "ELMA", "OKUL", "MASA"],
          correct: 2,
          points: 10,
        },
        {
          question: "'M' sesi ile başlayan kelime?",
          options: ["ARABA", "MASA", "KAPI", "PENCERE"],
          correct: 1,
          points: 10,
        },
        { question: "'E' sesi hangi kelimede yok?", options: ["ELMA", "KALE", "MASA", "OYUN"], correct: 3, points: 10 },
        { question: "'K' sesi kaç kere duyuluyor? KUKLA", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "'L' sesi hangi kelimede var?", options: ["MASA", "LALE", "KAPI", "OKUL"], correct: 3, points: 10 },
        {
          question: "'S' sesini duy: AS-SA",
          options: ["Başta", "Sonda", "İkisinde de", "Hiçbiri"],
          correct: 2,
          points: 15,
        },
        {
          question: "'B' sesi ile biten kelime?",
          options: ["ARABA", "KİTAP", "KALEM", "MASA"],
          correct: 1,
          points: 15,
        },
        { question: "'Ş' sesi hangi kelimede?", options: ["MASA", "ŞAPKA", "KALE", "OKUL"], correct: 1, points: 15 },
        {
          question: "'R' sesi hangi kelimede 2 kere?",
          options: ["ARABA", "KARE", "KARAR", "KORU"],
          correct: 2,
          points: 20,
        },
        {
          question: "'T' sesi başta mı sonda mı? ATET",
          options: ["Başta", "Sonda", "İkisinde de", "Ortada"],
          correct: 2,
          points: 20,
        },
      ],
      // Kelime İnşaatı (Disleksi - Hece Birleştirme)
      10: [
        { question: "KA + LEM = ?", options: ["KALEM", "KALAM", "KELAM", "KELEM"], correct: 0, points: 10 },
        { question: "MA + SA = ?", options: ["MASA", "MASE", "MOSA", "MESA"], correct: 0, points: 10 },
        { question: "E + LMA = ?", options: ["ELME", "ALMA", "ELMA", "ILMA"], correct: 2, points: 10 },
        { question: "BA + LIK = ?", options: ["BALIK", "BALAK", "BELIK", "BILIK"], correct: 0, points: 10 },
        { question: "O + KUL = ?", options: ["OKOL", "OKUL", "UKUL", "OKIL"], correct: 1, points: 10 },
        { question: "KA + PI = ?", options: ["KAPI", "KAPE", "KIPO", "KIPI"], correct: 0, points: 15 },
        { question: "KE + Dİ = ?", options: ["KEDE", "KİDİ", "KEDİ", "KADI"], correct: 2, points: 15 },
        { question: "A + RA + BA = ?", options: ["ARABA", "AREBA", "ORABA", "ARIBA"], correct: 0, points: 15 },
        { question: "AN + NE = ?", options: ["ANNE", "ANE", "ENNE", "INNE"], correct: 0, points: 20 },
        { question: "O + TU + BÜS = ?", options: ["OTOBÜS", "OTOBUS", "ATOBÜS", "UTOBÜS"], correct: 0, points: 20 },
      ],
      // Ayna Yazı (Disleksi - Ters Harf Okuma)
      26: [
        { question: "Aynada 'b' harfi nasıl görünür?", options: ["d", "p", "q", "b"], correct: 0, points: 10 },
        { question: "Ters 'd' harfi nedir?", options: ["b", "p", "q", "d"], correct: 0, points: 10 },
        { question: "'p' harfinin tersi?", options: ["b", "d", "q", "p"], correct: 2, points: 10 },
        { question: "Hangi harf simetrik? (aynı görünür)", options: ["b", "d", "A", "p"], correct: 2, points: 10 },
        { question: "'n' harfinin aynada görünümü?", options: ["u", "n", "m", "h"], correct: 0, points: 15 },
        { question: "Ters 'M' harfi?", options: ["W", "N", "M", "U"], correct: 0, points: 15 },
        { question: "'BAL' kelimesini aynada oku", options: ["LAB", "DAL", "PAL", "BAL"], correct: 0, points: 20 },
        { question: "Hangi kelime simetrik? ", options: ["MAMA", "BABA", "ANNE", "ALİ"], correct: 0, points: 20 },
        { question: "'EL' kelimesini ters çevir", options: ["LE", "EL", "3L", "L3"], correct: 0, points: 20 },
        { question: "Aynada 'KARA' nasıl görünür?", options: ["ARAK", "KARA", "KORO", "AKAR"], correct: 0, points: 25 },
      ],
      // Hızlı Kelime (Disleksi - Hızlı Okuma)
      12: [
        { question: "Hızlı oku: EV", options: ["EV", "VE", "AV", "İV"], correct: 0, points: 10 },
        { question: "Hızlı oku: KEDI", options: ["KEDİ", "KİDİ", "KEDE", "KADI"], correct: 0, points: 10 },
        { question: "Hızlı oku: MASA", options: ["MASA", "MASE", "MOSA", "SEMA"], correct: 0, points: 10 },
        { question: "Hızlı oku: OKUL", options: ["OKUL", "OKOL", "UKUL", "OLUK"], correct: 0, points: 10 },
        { question: "Hızlı oku: KALEM", options: ["KALEM", "KALAM", "KELAM", "MALEK"], correct: 0, points: 15 },
        { question: "Hızlı oku: ARABA", options: ["ARABA", "AREBA", "BARAA", "ABARA"], correct: 0, points: 15 },
        {
          question: "Hızlı oku: PENCERE",
          options: ["PENCERE", "PENÇERE", "PENCERE", "PENCEPE"],
          correct: 0,
          points: 20,
        },
        { question: "Hızlı oku: DEFTER", options: ["DEFTER", "DEFTAR", "DEPTER", "TEPFER"], correct: 0, points: 20 },
        {
          question: "Hızlı oku: ÖĞRETMEN",
          options: ["ÖĞRETMEN", "ÖGRETMEN", "ÖĞRETMAN", "ÖRETMEN"],
          correct: 0,
          points: 25,
        },
        {
          question: "Hızlı oku: BİLGİSAYAR",
          options: ["BİLGİSAYAR", "BİLGİSEYAR", "BİLGİSAYER", "BİLİGSAYAR"],
          correct: 0,
          points: 25,
        },
      ],
      // Sayı Bloğu (Diskalkuli - Sayı Tanıma)
      13: [
        { question: "Kaç tane kare var? ■■■", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "Kaç tane yıldız? ⭐⭐⭐⭐", options: ["3", "4", "5", "6"], correct: 1, points: 10 },
        { question: "Kaç tane top? ⚽⚽⚽⚽⚽", options: ["4", "5", "6", "7"], correct: 1, points: 10 },
        { question: "Kaç tane kalp? ❤️❤️", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "Kaç tane elma? 🍎🍎🍎🍎🍎🍎", options: ["5", "6", "7", "8"], correct: 1, points: 15 },
        { question: "Kaç tane ağaç? 🌳🌳🌳🌳🌳🌳🌳", options: ["6", "7", "8", "9"], correct: 1, points: 15 },
        { question: "3 ve 5 sayılarının toplamı?", options: ["6", "7", "8", "9"], correct: 2, points: 20 },
        { question: "7'den 2 eksik kaçtır?", options: ["4", "5", "6", "7"], correct: 1, points: 20 },
        { question: "2 ile 4 arasındaki sayı?", options: ["1", "2", "3", "5"], correct: 2, points: 20 },
        {
          question: "6'ya kadar say, hangi sayı eksik? 1,2,3,5,6",
          options: ["3", "4", "5", "7"],
          correct: 1,
          points: 25,
        },
      ],
      // Toplama Parkuru (Diskalkuli - Toplama)
      14: [
        { question: "1 + 1 = ?", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "2 + 1 = ?", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "3 + 2 = ?", options: ["4", "5", "6", "7"], correct: 1, points: 10 },
        { question: "4 + 1 = ?", options: ["4", "5", "6", "7"], correct: 1, points: 10 },
        { question: "2 + 3 = ?", options: ["4", "5", "6", "7"], correct: 1, points: 15 },
        { question: "5 + 2 = ?", options: ["6", "7", "8", "9"], correct: 1, points: 15 },
        { question: "3 + 4 = ?", options: ["6", "7", "8", "9"], correct: 1, points: 15 },
        { question: "6 + 3 = ?", options: ["8", "9", "10", "11"], correct: 1, points: 20 },
        { question: "7 + 4 = ?", options: ["10", "11", "12", "13"], correct: 1, points: 20 },
        { question: "8 + 5 = ?", options: ["12", "13", "14", "15"], correct: 1, points: 25 },
      ],
      // Çıkarma Şampiyonu (Diskalkuli - Çıkarma)
      15: [
        { question: "3 - 1 = ?", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "4 - 2 = ?", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "5 - 2 = ?", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "6 - 3 = ?", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "7 - 4 = ?", options: ["2", "3", "4", "5"], correct: 1, points: 15 },
        { question: "8 - 3 = ?", options: ["4", "5", "6", "7"], correct: 1, points: 15 },
        { question: "9 - 5 = ?", options: ["3", "4", "5", "6"], correct: 1, points: 15 },
        { question: "10 - 4 = ?", options: ["5", "6", "7", "8"], correct: 1, points: 20 },
        { question: "12 - 7 = ?", options: ["4", "5", "6", "7"], correct: 1, points: 20 },
        { question: "15 - 8 = ?", options: ["6", "7", "8", "9"], correct: 1, points: 25 },
      ],
      // Çarpım Tablosu (Diskalkuli - Çarpma)
      16: [
        { question: "2 × 1 = ?", options: ["1", "2", "3", "4"], correct: 1, points: 10 },
        { question: "2 × 2 = ?", options: ["2", "3", "4", "5"], correct: 2, points: 10 },
        { question: "3 × 2 = ?", options: ["4", "5", "6", "7"], correct: 2, points: 10 },
        { question: "2 × 4 = ?", options: ["6", "7", "8", "9"], correct: 2, points: 10 },
        { question: "3 × 3 = ?", options: ["6", "7", "8", "9"], correct: 3, points: 15 },
        { question: "4 × 2 = ?", options: ["6", "7", "8", "9"], correct: 2, points: 15 },
        { question: "5 × 2 = ?", options: ["8", "9", "10", "11"], correct: 2, points: 15 },
        { question: "3 × 4 = ?", options: ["10", "11", "12", "13"], correct: 2, points: 20 },
        { question: "5 × 3 = ?", options: ["12", "13", "14", "15"], correct: 3, points: 20 },
        { question: "6 × 4 = ?", options: ["22", "23", "24", "25"], correct: 2, points: 25 },
      ],
      // Kesir Ustası (Diskalkuli - Kesirler)
      17: [
        {
          question: "Pizza 2 parçaya bölünmüş, 1 parça yersen kaçını yedin?",
          options: ["1/2", "1/3", "1/4", "2/2"],
          correct: 0,
          points: 10,
        },
        {
          question: "4 parçalı pizzadan 2'sini yersen?",
          options: ["1/4", "2/4", "3/4", "4/4"],
          correct: 1,
          points: 10,
        },
        {
          question: "Hangi kesir daha büyük? 1/2 veya 1/4",
          options: ["1/2", "1/4", "Eşit", "Bilmem"],
          correct: 0,
          points: 15,
        },
        { question: "3 parçadan 1'ini yersen?", options: ["1/3", "2/3", "3/3", "1/2"], correct: 0, points: 10 },
        { question: "Tam bir elma kaç parça? 4/4 = ?", options: ["0", "1", "2", "4"], correct: 1, points: 15 },
        {
          question: "Hangi kesir daha küçük? 1/3 veya 1/2",
          options: ["1/2", "1/3", "Eşit", "Bilmem"],
          correct: 1,
          points: 15,
        },
        { question: "2/4 = 1/?", options: ["1", "2", "3", "4"], correct: 1, points: 20 },
        { question: "3/6 = 1/?", options: ["1", "2", "3", "4"], correct: 1, points: 20 },
        { question: "1/2 + 1/2 = ?", options: ["1/4", "2/2", "1", "2/4"], correct: 2, points: 25 },
        { question: "1/4 + 1/4 = ?", options: ["1/8", "2/4", "1/2", "2/8"], correct: 2, points: 25 },
      ],
      // Renk Patlaması (ADHD - Dikkat/Hız)
      18: [
        // ID changed from 18 to 18, duplicate, assuming it should be a unique ID. Using 18 again.
        { question: "Hangi renk farklı? 🔴🔴🔵🔴", options: ["1", "2", "3", "4"], correct: 2, points: 10 },
        { question: "Hızlıca bul! Kaç kırmızı var? 🔴🔵🔴🔴", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "Yeşili bul! 🔴🔵🟢🟡", options: ["1", "2", "3", "4"], correct: 2, points: 10 },
        { question: "Sarı kaç tane? 🟡🔴🟡🔵🟡", options: ["2", "3", "4", "5"], correct: 1, points: 10 },
        { question: "Farklı olan? 🟢🟢🟢🔵", options: ["1", "2", "3", "4"], correct: 3, points: 15 },
        { question: "Mavi kaç tane? 🔵🔴🔵🔵🟡", options: ["2", "3", "4", "5"], correct: 1, points: 15 },
        { question: "Kırmızı hangi sırada? 🔵🔴🟢🟡", options: ["1", "2", "3", "4"], correct: 1, points: 15 },
        { question: "Kaç farklı renk var? 🔴🔵🔴🟢", options: ["2", "3", "4", "5"], correct: 1, points: 20 },
        {
          question: "Hangi renk tekrar ediyor? 🔴🔵🔴🟢",
          options: ["Kırmızı", "Mavi", "Yeşil", "Hiçbiri"],
          correct: 0,
          points: 20,
        },
        { question: "Sarı ve mavi kaç tane? 🟡🔵🟡🔵🔴", options: ["3", "4", "5", "6"], correct: 1, points: 25 },
      ],
      // Simon Der Ki (ADHD - Sıra Takibi)
      19: [
        // ID changed from 19 to 19, duplicate, assuming it should be a unique ID. Using 19 again.
        { question: "Sırayı takip et: 🔴🔵 devamı?", options: ["🔴", "🔵", "🟢", "🟡"], correct: 0, points: 10 },
        { question: "Desen: 🟢🔵🟢🔵 sonrası?", options: ["🟢", "🔵", "🔴", "🟡"], correct: 0, points: 10 },
        { question: "Sıra: 1-2-1-2 devamı?", options: ["1", "2", "3", "4"], correct: 0, points: 10 },
        { question: "Desen: A-B-A-B sonrası?", options: ["A", "B", "C", "D"], correct: 0, points: 10 },
        { question: "Sıra: ⭐❤️⭐❤️ sonrası?", options: ["⭐", "❤️", "💙", "🌟"], correct: 0, points: 15 },
        { question: "Desen: 🔺🔻🔺🔻 devamı?", options: ["🔺", "🔻", "🔶", "◆"], correct: 0, points: 15 },
        { question: "Sıra: 1-2-3-1-2-3 sonrası?", options: ["1", "2", "3", "4"], correct: 0, points: 20 },
        { question: "Desen: 🔴🔵🟢🔴🔵🟢 devamı?", options: ["🔴", "🔵", "🟢", "🟡"], correct: 0, points: 20 },
        { question: "Karmaşık: A-B-C-A-B-C sonrası?", options: ["A", "B", "C", "D"], correct: 0, points: 25 },
        { question: "Sıra: 1-1-2-2-3-3 devamı?", options: ["3", "4", "1", "2"], correct: 1, points: 25 },
      ],
      // Farklı Bul Pro (ADHD - Görsel Tarama)
      20: [
        // ID changed from 20 to 20, duplicate, assuming it should be a unique ID. Using 20 again.
        {
          question: "KIRMIZI renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 0,
          points: 10,
          type: "color-match" as const,
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "MAVİ renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 1,
          points: 10,
          type: "color-match" as const,
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "YEŞİL renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 2,
          points: 10,
          type: "color-match" as const,
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "SARI renge tıkla!",
          options: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],
          correct: 3,
          points: 10,
          type: "color-match" as const,
          colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
        },
        {
          question: "MOR renge tıkla!",
          options: ["Kırmızı", "Mavi", "Mor", "Turuncu"],
          correct: 2,
          points: 15,
          type: "color-match" as const,
          colors: ["bg-red-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"],
        },
        {
          question: "TURUNCU renge tıkla!",
          options: ["Sarı", "Mavi", "Mor", "Turuncu"],
          correct: 3,
          points: 15,
          type: "color-match" as const,
          colors: ["bg-yellow-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"],
        },
        {
          question: "PEMBE renge tıkla!",
          options: ["Pembe", "Mor", "Kırmızı", "Turuncu"],
          correct: 0,
          points: 20,
          type: "color-match" as const,
          colors: ["bg-pink-500", "bg-purple-500", "bg-red-500", "bg-orange-500"],
        },
        {
          question: "KAHVERENGİ renge tıkla!",
          options: ["Turuncu", "Kahverengi", "Kırmızı", "Mor"],
          correct: 1,
          points: 20,
          type: "color-match" as const,
          colors: ["bg-orange-500", "bg-amber-700", "bg-red-500", "bg-purple-500"],
        },
        {
          question: "GRİ renge tıkla!",
          options: ["Siyah", "Gri", "Beyaz", "Mavi"],
          correct: 1,
          points: 25,
          type: "color-match" as const,
          colors: ["bg-black", "bg-gray-500", "bg-white border border-gray-300", "bg-blue-500"],
        },
        {
          question: "AÇIK MAVİ renge tıkla!",
          options: ["Mavi", "Açık Mavi", "Mor", "Yeşil"],
          correct: 1,
          points: 25,
          type: "color-match" as const,
          colors: ["bg-blue-700", "bg-cyan-400", "bg-purple-500", "bg-green-500"],
        },
      ],
      // Odak Tüneli (ADHD - Odaklanma)
      21: [
        // ID changed from 21 to 21, duplicate, assuming it should be a unique ID. Using 21 again.
        {
          question: "HEDEF harfini bul: K (diğerleri: M,N,H)",
          options: ["K", "M", "N", "H"],
          correct: 0,
          points: 10,
        },
        {
          question: "Sadece 'A' say: A B A C A",
          options: ["2", "3", "4", "5"],
          correct: 1,
          points: 10,
        },
        {
          question: "Hedef: 5 (Sayılar: 5,3,5,7,5)",
          options: ["2", "3", "4", "5"],
          correct: 1,
          points: 10,
        },
        {
          question: "Sadece ⭐ say: ⭐💫⭐🌟⭐",
          options: ["2", "3", "4", "5"],
          correct: 1,
          points: 10,
        },
        {
          question: "Hedef kelime: KEDI (KEDİ,KADI,KEDİ,KEDI)",
          options: ["1", "2", "3", "4"],
          correct: 3,
          points: 15,
        },
        {
          question: "'E' harfi kaç tane? ELMA-KALE-EVE",
          options: ["3", "4", "5", "6"],
          correct: 1,
          points: 15,
        },
        {
          question: "Sadece 🔴 say: 🔴🔵🔴🔴🔵🔴",
          options: ["3", "4", "5", "6"],
          correct: 1,
          points: 20,
        },
        {
          question: "Hedef: MASA (MASA,MESE,MASA,MISA)",
          options: ["1 ve 3", "2 ve 4", "Hepsi", "Hiçbiri"],
          correct: 0,
          points: 20,
        },
        {
          question: "'A' harfi toplam kaç? ARABA-MASA-KAPI",
          options: ["5", "6", "7", "8"],
          correct: 1,
          points: 25,
        },
        {
          question: "Sadece ❤️ say: ❤️💙❤️💚❤️💛❤️",
          options: ["3", "4", "5", "6"],
          correct: 1,
          points: 25,
        },
      ],
      // Ritim Ustası (ADHD - Zamanlama)
      22: [
        // ID changed from 22 to 22, duplicate, assuming it should be a unique ID. Using 22 again.
        {
          question: "Ritim: TAK-TAK-_ (devamı?)",
          options: ["TAK", "TIK", "TOK", "SESSIZ"],
          correct: 0,
          points: 10,
        },
        {
          question: "Desen: 👏👏_ (devamı?)",
          options: ["👏", "✋", "🤚", "Durak"],
          correct: 0,
          points: 10,
        },
        {
          question: "Tempo: HIZLI-HIZLI-? ",
          options: ["HIZLI", "YAVAS", "ORTA", "DUR"],
          correct: 0,
          points: 10,
        },
        {
          question: "Ritim: 1-2-1-2-?",
          options: ["1", "2", "3", "Durak"],
          correct: 0,
          points: 10,
        },
        {
          question: "Müzik: 🎵🎵🎶 sonrası?",
          options: ["🎵", "🎶", "🎼", "Sessiz"],
          correct: 0,
          points: 15,
        },
        {
          question: "Tempo değişimi: YAVAS-HIZLI-?",
          options: ["YAVAS", "HIZLI", "ORTA", "DUR"],
          correct: 0,
          points: 15,
        },
        {
          question: "Ritim: TAK-TIK-TAK-TIK-?",
          options: ["TAK", "TIK", "TOK", "Durak"],
          correct: 0,
          points: 20,
        },
        {
          question: "Karmaşık: 1-1-2-1-1-2-?",
          options: ["1", "2", "3", "Durak"],
          correct: 0,
          points: 20,
        },
        {
          question: "Hızlı ritim: 👏👏✋👏👏✋ sonrası?",
          options: ["👏", "✋", "🤚", "Durak"],
          correct: 0,
          points: 25,
        },
        {
          question: "Tempo: H-H-Y-H-H-Y-? (H=Hızlı Y=Yavaş)",
          options: ["H", "Y", "O", "D"],
          correct: 0,
          points: 25,
        },
      ],
      // Harf Çizimi (Disgrafya - El Koordinasyonu)
      23: [
        { question: "Hangi harf daha kolay çizilir?", options: ["I", "B", "R", "S"], correct: 0, points: 10 },
        { question: "Düz çizgi hangi harfte var?", options: ["O", "C", "T", "S"], correct: 2, points: 10 },
        { question: "Hangi harf yuvarlak içerir?", options: ["T", "L", "O", "İ"], correct: 2, points: 10 },
        { question: "En basit şekil hangisi?", options: ["●", "■", "▲", "★"], correct: 0, points: 10 },
        { question: "Hangi harf simetrik?", options: ["R", "A", "B", "P"], correct: 1, points: 15 },
        { question: "'L' harfi kaç çizgi?", options: ["1", "2", "3", "4"], correct: 1, points: 15 },
        { question: "'E' harfi kaç yatay çizgi?", options: ["2", "3", "4", "5"], correct: 1, points: 15 },
        { question: "Hangi harf çapraz çizgi içerir?", options: ["T", "L", "X", "O"], correct: 2, points: 20 },
        { question: "'M' harfi kaç tepe içerir?", options: ["1", "2", "3", "4"], correct: 1, points: 20 },
        { question: "En zor çizilen harf?", options: ["I", "O", "Q", "T"], correct: 2, points: 25 },
      ],
      // Kelime Dizgini (Disgrafya - Klavye/Yazma)
      24: [
        { question: "Doğru yazım hangisi?", options: ["MASA", "MASE", "MOSA", "MASO"], correct: 0, points: 10 },
        { question: "Hatasız kelime?", options: ["KALEMı", "KALEM", "KELEM", "KALM"], correct: 1, points: 10 },
        { question: "Doğru yazılmış?", options: ["OKUL", "OKOL", "UKUL", "OKÜŁ"], correct: 0, points: 10 },
        { question: "Yazım hatası hangisinde?", options: ["KAPI", "MASA", "KEDI", "KÜTAP"], correct: 3, points: 10 },
        {
          question: "Hatasız cümle?",
          options: ["Ali okula giti", "Ali okula gitti", "Ali okula giti", "ali okula gitti"],
          correct: 1,
          points: 15,
        },
        {
          question: "Büyük harf gerekli mi? istanbul",
          options: ["Evet", "Hayır", "İsteğe bağlı", "Bilmem"],
          correct: 0,
          points: 15,
        },
        {
          question: "Nokta gerekli mi? Ali okudu",
          options: ["Evet", "Hayır", "Bazen", "Bilmem"],
          correct: 0,
          points: 15,
        },
        {
          question: "Doğru yazım? Öğretmen",
          options: ["OGRETMEN", "ÖGRETMEN", "ÖĞRETMEN", "OGRETMN"],
          correct: 2,
          points: 20,
        },
        { question: "Çoğul eki? AĞAÇ-?", options: ["LAR", "LER", "LAR", "İLER"], correct: 0, points: 20 },
        {
          question: "Hatasız paragraf hangisi?",
          options: ["Ali okula gitti.", "ali Okula gitti", "Ali okula gitti", "ALİ OKULA GİTTİ"],
          correct: 0,
          points: 25,
        },
      ],
      // El Yazısı Atölyesi (Disgrafya - El Yazısı)
      25: [
        { question: "El yazısında hangi harf daha akıcı?", options: ["a", "b", "i", "m"], correct: 2, points: 10 },
        { question: "Bitişik yazıda kolay harf?", options: ["l", "k", "f", "ğ"], correct: 0, points: 10 },
        { question: "Hangi harf tek hamlede yazılır?", options: ["a", "e", "o", "ü"], correct: 2, points: 10 },
        {
          question: "El yazısı için en uygun kalem tutuş?",
          options: ["Sıkı", "Gevşek", "Orta", "Çok sıkı"],
          correct: 2,
          points: 10,
        },
        {
          question: "'l' ve 'i' harflerinin farkı nedir?",
          options: ["Nokta", "Boy", "Genişlik", "Şekil"],
          correct: 0,
          points: 15,
        },
        { question: "Bitişik yazıda 'm' kaç tepe?", options: ["1", "2", "3", "4"], correct: 1, points: 15 },
        {
          question: "El yazısında 'b' ve 'd' farkı?",
          options: ["Yön", "Boy", "Genişlik", "Nokta"],
          correct: 0,
          points: 20,
        },
        {
          question: "Hangi kelime bitişik yazıda daha kolay?",
          options: ["mama", "baba", "anne", "elma"],
          correct: 0,
          points: 20,
        },
        { question: "Yazı eğimi kaç derece olmalı?", options: ["0°", "15°", "45°", "90°"], correct: 1, points: 25 },
        { question: "En zor bitişik harf kombinasyonu?", options: ["al", "el", "rl", "il"], correct: 2, points: 25 },
      ],
      // Sesli Harf Tanıma Oyunu (Disleksi - Sesli Harf Tanıma)
      // ID 11 was re-purposed for this new game type.
      // Previously, ID 11 was 'Ayna Yazı (Disleksi - Ters Harf Okuma)'
      // This new game type requires Web Speech API integration.
      // The existing 'Ayna Yazı' questions are now moved to a new ID.
      // Let's assume 'Ayna Yazı' is now game ID 26.
      11: [
        // Sesli Harf Tanıma Oyunu - Game ID 11
        { question: "A sesi", options: ["A", "E", "O", "U"], correct: 0, points: 10, type: "audio-letter" },
        { question: "B sesi", options: ["P", "B", "D", "T"], correct: 1, points: 10, type: "audio-letter" },
        { question: "C sesi", options: ["S", "Ç", "C", "J"], correct: 2, points: 10, type: "audio-letter" },
        { question: "D sesi", options: ["B", "T", "D", "P"], correct: 2, points: 10, type: "audio-letter" },
        { question: "E sesi", options: ["İ", "A", "E", "O"], correct: 2, points: 10, type: "audio-letter" },
        { question: "F sesi", options: ["V", "F", "S", "H"], correct: 1, points: 15, type: "audio-letter" },
        { question: "G sesi", options: ["K", "Ğ", "G", "J"], correct: 2, points: 15, type: "audio-letter" },
        { question: "H sesi", options: ["H", "N", "M", "K"], correct: 0, points: 15, type: "audio-letter" },
        { question: "I sesi", options: ["İ", "I", "L", "J"], correct: 1, points: 15, type: "audio-letter" },
        { question: "İ sesi", options: ["I", "İ", "L", "J"], correct: 1, points: 15, type: "audio-letter" },
        { question: "K sesi", options: ["G", "Q", "K", "C"], correct: 2, points: 20, type: "audio-letter" },
        { question: "L sesi", options: ["I", "L", "İ", "T"], correct: 1, points: 20, type: "audio-letter" },
        { question: "M sesi", options: ["N", "M", "W", "H"], correct: 1, points: 20, type: "audio-letter" },
        { question: "N sesi", options: ["M", "H", "N", "R"], correct: 2, points: 20, type: "audio-letter" },
        { question: "O sesi", options: ["Ö", "U", "O", "A"], correct: 2, points: 20, type: "audio-letter" },
      ],
    }

    // Oyuna özel sorular varsa onları kullan, yoksa genel kategoriye dön
    if (games[gameId]) {
      // gameId is undeclared here
      return shuffleArray(games[gameId]).slice(0, 10)
    }

    // Genel kategori soruları (eski oyunlar için)
    return getQuestions(game?.category || "reading", game?.difficulty_level || "kolay", level)
  }

  // Web Speech API related functions
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return // Sessizce geç
    }
    setIsSpeaking(true)
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "tr-TR"
      utterance.rate = 1
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false) // Hata durumunda sessizce geç
      }
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }

  const playLetterSound = useCallback((letter: string) => {
    if (typeof window === "undefined") return

    setIsPlayingAudio(true)
    setShowResult(false)

    // Ses API'sini atla, direkt görsel moda geç
    setTimeout(() => {
      setIsPlayingAudio(false)
      setAudioPlayed(true)
    }, 500)
  }, [])

  const listen = async (correctAnswer: string): Promise<boolean> => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech Recognition not supported in this browser.")
      return false
    }

    return new Promise((resolve) => {
      const recognition = new webkitSpeechRecognition()
      recognition.lang = "tr-TR" // Set language to Turkish
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase()
        const correctAnswerLower = correctAnswer.toLowerCase()
        console.log(`Heard: ${transcript}, Correct: ${correctAnswerLower}`)
        resolve(transcript === correctAnswerLower)
      }

      recognition.onspeechend = () => {
        recognition.stop()
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech Recognition Error:", event.error)
        resolve(false)
      }

      recognition.start()
    })
  }

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const [gameRes, profileRes] = await Promise.all([fetch(`/api/games/${id}`), getProfile()])

        if (!gameRes.ok) throw new Error("Game not found")
        const gameData = await gameRes.json()
        setGame(gameData)

        let level = 1
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          level = profileData.level || 1
          setStudentLevel(level)
        }

        const gameId = Number.parseInt(id)
        const gameSpecificQuestions = getGameSpecificQuestions(gameId, level)
        if (gameSpecificQuestions.length > 0) {
          setQuestions(gameSpecificQuestions)
          if (gameId === 1) {
            // Harf Dedektifi: ilk sorunun harflerini karıştır
            const firstQ = gameSpecificQuestions[0]
            if (firstQ.scrambled) {
              setScrambledLetters(shuffleArray([...firstQ.scrambled]))
            }
          } else if (gameId === 5) {
            setIsPreviewingCards(true)
            setPreviewCountdown(10)
          } else if (gameId === 11) {
            // Game 11: Sesli Harf Tanıma Oyunu
            // Speak the question for the first 'audio-letter' question
            const firstQuestion = gameSpecificQuestions.find((q) => q.type === "audio-letter")
            if (firstQuestion) {
              speak(firstQuestion.question)
            }
          }
        } else {
          setQuestions(getQuestions(gameData.category, gameData.difficulty_level, level))
        }
      } catch (error) {
        console.error("[v0] Error fetching game:", error)
      }
    }
    fetchGame()
  }, [id])

  useEffect(() => {
    if (game?.id === 11 && questions.length > 0 && !isComplete && !audioPlayed) {
      const currentQ = questions[currentQuestionIndex]
      if (currentQ?.type === "audio-letter") {
        // 1 saniye bekle sonra sesi çal
        const timer = setTimeout(() => {
          playLetterSound(currentQ.question)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [game?.id, currentQuestionIndex, questions, isComplete, audioPlayed, playLetterSound])

  useEffect(() => {
    setAudioPlayed(false)
  }, [currentQuestionIndex])

  useEffect(() => {
    if (isPreviewingCards && previewCountdown > 0) {
      const timer = setTimeout(() => {
        setPreviewCountdown(previewCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isPreviewingCards && previewCountdown === 0) {
      setIsPreviewingCards(false)
    }
  }, [isPreviewingCards, previewCountdown])

  useEffect(() => {
    if (game?.id === 5 && currentQuestionIndex > 0) {
      setIsPreviewingCards(true)
      setPreviewCountdown(10)
    }
  }, [currentQuestionIndex, game?.id])

  useEffect(() => {
    if (!sessionStarted || isComplete) return
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [sessionStarted, isComplete])

  useEffect(() => {
    if (questions.length > 0) {
      let max = 0
      questions.forEach((q) => {
        if (game?.id === 5) {
          // Memory game: 10 points per pair
          max += ((q.items?.length || 0) / 2) * 10
        } else if (game?.id === 21) {
          // Simon says: points from question
          max += q.points
        } else {
          // Standard games: base points only (no bonus)
          max += q.points
        }
      })
      setMaxScore(max)
    }
  }, [questions, game?.id])

  const startSession = async () => {
    try {
      const res = await fetch("/api/game-session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: Number.parseInt(id) }),
      })
      const data = await res.json()
      setSessionId(data.sessionId)
      setSessionStarted(true)
    } catch (error) {
      console.error("[v0] Error starting session:", error)
    }
  }

  const completeSession = async (finalScore: number) => {
    if (!sessionId) return

    try {
      await fetch("/api/game-session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          score: finalScore,
          duration: timeElapsed,
        }),
      })
      setIsComplete(true)
    } catch (error) {
      console.error("[v0] Error completing session:", error)
    }
  }

  const playApplauseSound = () => {
    try {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alkis-bptGNEgThVfS6V4sAY02qd7QQ9JSoR.mp3")
      audio.volume = 0.5
      audio.play().catch((err) => console.error("[v0] Alkış sesi çalınamadı:", err))
    } catch (error) {
      console.error("[v0] Ses dosyası yüklenemedi:", error)
    }
  }

  const handleMemoryCardClick = (index: number) => {
    if (isPreviewingCards || answered || matchedPairs.includes(index) || selectedCards.includes(index)) return

    setFlippedCards([...flippedCards, index])

    const newSelected = [...selectedCards, index]
    setSelectedCards(newSelected)

    if (newSelected.length === 2) {
      const [first, second] = newSelected
      const currentQ = questions[currentQuestionIndex] // Ensure currentQ is defined

      if (!currentQ || !currentQ.items) {
        // Handle cases where currentQ or items might be undefined (should not happen in normal flow)
        console.error("Error: Missing current question or items in memory game.")
        setSelectedCards([]) // Reset selected cards to avoid getting stuck
        return
      }

      const card1 = currentQ.items[first]
      const card2 = currentQ.items[second]

      if (card1 === card2) {
        setMatchedPairs([...matchedPairs, first, second])
        playApplauseSound()
        setScore((prev) => prev + 10)
        setStreak((prev) => prev + 1)

        if (matchedPairs.length + 2 === currentQ.items.length) {
          setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1)
              setSelectedCards([])
              setMatchedPairs([])
              setFlippedCards([])
              setIsPreviewingCards(true) // Start preview for the next card set
              setPreviewCountdown(10) // Reset preview timer
            } else {
              completeSession(score + 10) // Add points for the last matched pair
            }
          }, 1000)
        } else {
          setTimeout(() => setSelectedCards([]), 500)
        }
      } else {
        setStreak(0)
        setFeedback("Eşleşmedi, tekrar dene!")
        setFeedbackType("error")
        setTimeout(() => {
          setSelectedCards([])
          setFlippedCards(flippedCards.filter((i) => !newSelected.includes(i)))
          setFeedback(null) // Clear feedback after a short delay
        }, 1000)
      }
    }
  }

  const handleSequenceItem = (item: string) => {
    if (isShowingSequence || answered) return

    const newUserSequence = [...userSequence, item]
    setUserSequence(newUserSequence)

    const currentQ = questions[currentQuestionIndex]
    // Ensure currentQ.sequence is defined and is an array of strings or numbers
    const correctSequence = (currentQ.sequence || []).map(String) // Convert to string for comparison

    // Check if current input matches so far
    if (newUserSequence[newUserSequence.length - 1] !== correctSequence[newUserSequence.length - 1]) {
      setFeedback("Yanlış sıra! Tekrar dene.")
      setFeedbackType("error")
      setUserSequence([])
      setLives((prev) => prev - 1)
      setTimeout(() => setFeedback(null), 1500)
      return
    }

    // Check if sequence is complete
    if (newUserSequence.length === correctSequence.length) {
      playApplauseSound()
      setScore((prev) => prev + currentQ.points)
      setFeedback(`Doğru sıra! +${currentQ.points} puan`)
      setFeedbackType("success")
      setAnswered(true)

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setUserSequence([])
          setAnswered(false)
          setFeedback(null)
          // Reset sequence game state for the next question
          setIsShowingSequence(false) // Ensure this is reset
        } else {
          completeSession(score + currentQ.points)
        }
      }, 1500)
    }
  }

  const handleAnswer = (selectedIndex: number) => {
    if (answered) return

    const currentQ = questions[currentQuestionIndex]
    const isCorrect = selectedIndex === currentQ.correct
    setAnswered(true)
    setSelectedAnswer(selectedIndex)
    setShowResult(true)

    if (isCorrect) {
      const earnedPoints = currentQ.points
      setScore((prev) => prev + earnedPoints)
      setFeedback(`Doğru! +${earnedPoints} puan`)
      setFeedbackType("success")
      playApplauseSound()
      setStreak(streak + 1)
    } else {
      setFeedback(`Yanlış! Doğru cevap: ${currentQ.options[currentQ.correct]}`)
      setFeedbackType("error")
      setStreak(0)
      setLives((prev) => prev - 1)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setAnswered(false)
        setSelectedAnswer(null)
        setFeedback(null)
        setShowFeedback(null)
        setSelectedCards([])
        setFlippedCards([])
        setMatchedPairs([])
        setUserSequence([])
        setIsShowingSequence(false)
        setShowResult(false)
        setSelectedLetters([])
        // Harf Dedektifi: sonraki sorunun harflerini karistir
        const nextQ = questions[nextIndex]
        if (nextQ?.scrambled) {
          setScrambledLetters(shuffleArray([...nextQ.scrambled]))
        }
      } else {
        const finalScore = score + (isCorrect ? currentQ.points : 0)
        completeSession(finalScore)
      }
    }, 1500)
  }

  useEffect(() => {
    if (lives <= 0 && sessionStarted && !isComplete) {
      completeSession(score)
    }
  }, [lives, sessionStarted, isComplete, score])

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/student/games">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">{game.title}</CardTitle>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="secondary">{game.category}</Badge>
                <Badge variant="outline">{game.difficulty_level}</Badge>
                <Badge>Seviye {studentLevel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Oyun Kuralları
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 mt-1 text-yellow-500" />
                    <span>10 soru cevaplayacaksın</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-1 text-red-500" />
                    <span>3 can hakkın var</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-1 text-blue-500" />
                    <span>Seri yaparak bonus puan kazan!</span>
                  </li>
                </ul>
              </div>

              <Button onClick={startSession} size="lg" className="w-full text-lg h-14">
                Oyuna Başla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">Oyun Tamamlandı!</CardTitle>
              <p className="text-muted-foreground">Harika bir performans gösterdin!</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Toplam Puan</p>
                  <p className="text-3xl font-bold text-blue-600">{score}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Başarı Oranı</p>
                  <p className="text-3xl font-bold text-green-600">{percentage}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">En Yüksek Seri</p>
                  <p className="text-3xl font-bold text-purple-600">{streak}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Süre</p>
                  <p className="text-3xl font-bold text-orange-600">{timeElapsed}s</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/student/games" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Oyunlara Dön
                  </Button>
                </Link>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Tekrar Oyna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const renderGameContent = () => {
    const currentQ = questions[currentQuestionIndex]

    if (!currentQ) {
      return <p>Sorular yükleniyor...</p>
    }

    // Harf Dedektifi - Karışık harflerden kelime oluşturma
    if (currentQ.type === "letter-detective") {
      const speakLetter = (letter: string) => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(letter)
          utterance.lang = "tr-TR"
          utterance.rate = 0.8
          utterance.volume = 1
          window.speechSynthesis.speak(utterance)
        }
      }

      return (
        <div className="space-y-8">
          {/* Soru */}
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">{currentQ.question}</p>
            {currentQ.hint && (
              <p className="text-sm text-muted-foreground italic">Ipucu: {currentQ.hint}</p>
            )}
          </div>

          {/* Karışık Harfler */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Harflere tıklayarak seslerini dinle:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {scrambledLetters.map((letter, idx) => (
                <button
                  key={idx}
                  onClick={() => speakLetter(letter)}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Secenekler */}
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground font-medium">Doğru kelimeyi sec:</p>
            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = index === currentQ.correct
                const showCorrect = showResult && isCorrectAnswer
                const showWrong = showResult && isSelected && !isCorrectAnswer

                return (
                  <button
                    key={index}
                    onClick={() => !answered && handleAnswer(index)}
                    disabled={answered}
                    className={`p-5 rounded-2xl text-2xl font-bold tracking-widest transition-all duration-300 border-2 ${
                      showCorrect
                        ? "bg-green-100 border-green-500 text-green-700 scale-105 shadow-lg shadow-green-200"
                        : showWrong
                          ? "bg-red-100 border-red-500 text-red-700 scale-95"
                          : isSelected
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700 scale-105"
                            : "bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105 text-gray-800 shadow-md"
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    if (currentQ.type === "memory-cards") {
      return (
        <div className="space-y-6">
          <p className="text-xl text-center font-semibold">{currentQ.question}</p>
          {isPreviewingCards && (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{previewCountdown}</div>
              <p className="text-muted-foreground">Kartları ezberleyin!</p>
            </div>
          )}
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {currentQ.items?.map((item, idx) => {
              const isFlipped = isPreviewingCards || flippedCards.includes(idx) || matchedPairs.includes(idx)
              const isMatched = matchedPairs.includes(idx)

              return (
                <Card
                  key={idx}
                  className={`aspect-square flex items-center justify-center text-4xl cursor-pointer transition-all ${
                    isMatched
                      ? "bg-green-100 border-green-500"
                      : isPreviewingCards
                        ? "bg-blue-50"
                        : "hover:bg-primary/10"
                  }`}
                  onClick={() => handleMemoryCardClick(idx)} // Use the updated handler
                  disabled={isPreviewingCards || answered || matchedPairs.includes(idx) || selectedCards.length >= 2}
                >
                  <CardContent className="p-0 flex items-center justify-center w-full h-full">
                    {isFlipped ? item : "❓"}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )
    }

    // Renk Patlaması - Renk kutularıyla eşleştirme
    if (currentQ.type === "color-match" && currentQ.colors) {
      // Sorudan renk ismini çıkar (örn: "KIRMIZI renge tıkla!" -> "KIRMIZI")
      const colorName = currentQ.question.split(" ")[0]

      return (
        <div className="space-y-8">
          {/* Üstte büyük renk ismi */}
          <div className="text-center">
            <div className="inline-block px-12 py-8 bg-white rounded-3xl shadow-xl border-4 border-primary">
              <p className="text-6xl font-bold text-gray-800 tracking-wider">{colorName}</p>
            </div>
            <p className="text-xl text-muted-foreground mt-4">Bu rengi aşağıdan seç!</p>
          </div>

          {/* Altta renkli kutular */}
          <div className="grid grid-cols-2 gap-6">
            {currentQ.colors.map((colorClass: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`h-40 rounded-2xl border-4 transition-all duration-300 ${colorClass} ${
                  selectedAnswer === index
                    ? index === currentQ.correct
                      ? "border-green-500 scale-105 shadow-2xl shadow-green-500/50"
                      : "border-red-500 scale-95"
                    : "border-gray-300 hover:border-gray-400 hover:scale-105"
                }`}
                style={{
                  boxShadow:
                    selectedAnswer === index && index === currentQ.correct
                      ? "0 0 30px rgba(34, 197, 94, 0.5)"
                      : undefined,
                }}
              >
                <span className="sr-only">{currentQ.options[index]}</span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (currentQ.type === "sequence") {
      return (
        <div className="space-y-6 text-center">
          <p className="text-xl font-semibold mb-4">{currentQ.question}</p>
          {/* Display the sequence the user has entered so far */}
          <p className="text-sm text-muted-foreground mb-4">Sıranız: {userSequence.join(" → ")}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {currentQ.items?.map((item, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="p-6 h-auto text-4xl bg-transparent"
                onClick={() => handleSequenceItem(item)}
                disabled={isShowingSequence || answered}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      )
    }

    if (game?.id === 11 && currentQ?.type === "audio-letter") {
      // Show start screen if game hasn't started
      if (!audioGameStarted) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center space-y-6">
              <div className="text-6xl">🔊</div>
              <h1 className="text-3xl font-bold text-purple-600">Ses Avcısı</h1>
              <p className="text-gray-600 text-lg">
                Ekranda bir harf göreceksin. Bu harfi aşağıdaki şıklardan bul ve seç!
              </p>
              <div className="bg-purple-100 rounded-xl p-4">
                <p className="text-purple-700 font-medium">Hazır olduğunda aşağıdaki butona bas!</p>
              </div>
              <button
                onClick={() => setAudioGameStarted(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-transform shadow-lg"
              >
                Oyuna Başla!
              </button>
            </div>
          </div>
        )
      }

      // Game is started - show the actual game
      const targetLetter = currentQ.question.replace(" sesi", "")

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 p-4">
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-purple-600">
                  Soru {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">{score} Puan</span>
                <span className="text-red-500 text-2xl">{"❤️".repeat(lives)}</span>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="max-w-md mx-auto space-y-8">
            {/* Letter Display */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
                <div className="text-white text-xl font-bold mb-4">Bu Harfi Bul!</div>
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-9xl font-bold text-purple-600">{targetLetter}</div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`text-center p-4 rounded-2xl font-bold text-xl ${
                  feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {feedback}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = index === currentQ.correct
                const showCorrect = showResult && isCorrectAnswer
                const showWrong = showResult && isSelected && !isCorrectAnswer

                return (
                  <button
                    key={index}
                    onClick={() => !answered && handleAnswer(index)}
                    disabled={answered}
                    className={`p-8 rounded-2xl text-6xl font-bold transition-all duration-300 transform ${
                      showCorrect
                        ? "bg-green-500 text-white scale-105 ring-4 ring-green-300"
                        : showWrong
                          ? "bg-red-500 text-white scale-95"
                          : isSelected
                            ? "bg-purple-500 text-white scale-105"
                            : "bg-white hover:bg-purple-100 hover:scale-105 text-gray-800 shadow-lg"
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <p className="text-xl text-center font-semibold">{currentQ.question}</p>
        {currentQ.hint && <p className="text-sm text-muted-foreground text-center italic">💡 İpucu: {currentQ.hint}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((option, idx) => (
            <Button
              key={idx}
              variant={
                answered
                  ? idx === currentQ.correct
                    ? "default"
                    : idx === selectedAnswer
                      ? "destructive"
                      : "outline"
                  : "outline"
              }
              className="p-6 h-auto text-lg"
              onClick={() => handleAnswer(idx)}
              disabled={answered}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-semibold">
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/student/games">
          <Button variant="ghost" className="text-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Geri Dön
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="mr-2 h-5 w-5" />
            {timeElapsed}s
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Star className="mr-2 h-5 w-5" />
            {score} Puan
          </Badge>
          {streak > 1 && (
            <Badge variant="default" className="bg-orange-500 text-lg px-4 py-2">
              <Zap className="mr-2 h-5 w-5" />x{streak} Seri!
            </Badge>
          )}
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`h-7 w-7 ${i < lives ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl">
              Soru {currentQuestionIndex + 1}/{questions.length}
            </CardTitle>
            {game.category === "memory" && (
              <Badge variant="default" className="bg-indigo-500">
                <Sparkles className="w-4 h-4 mr-1" />
                Hafıza Kartları
              </Badge>
            )}
            {game.category === "attention" && (
              <Badge variant="default" className="bg-green-500">
                <Target className="w-4 h-4 mr-1" />
                Dikkat Oyunu
              </Badge>
            )}
            {game.id === 1 && (
              <Badge variant="default" className="bg-indigo-500">
                <Brain className="w-4 h-4 mr-1" />
                Harf Dedektifi
              </Badge>
            )}
            {game.id === 11 && ( // Check if it's the audio-letter game
              <Badge variant="default" className="bg-purple-500">
                <Brain className="w-4 h-4 mr-1" />
                Sesli Harf Tanıma
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6 py-8">
          {renderGameContent()}

          {feedback && (
            <div
              className={`p-4 rounded-lg text-center font-semibold ${
                feedbackType === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}
            >
              {feedback}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {isComplete && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">Oyun Tamamlandı!</CardTitle>
              <p className="text-muted-foreground">Harika bir performans gösterdin!</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Toplam Puan</p>
                  <p className="text-3xl font-bold text-blue-600">{score}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Başarı Oranı</p>
                  <p className="text-3xl font-bold text-green-600">
                    {/* Use maxScore for accurate percentage calculation */}
                    {maxScore > 0 ? Math.round((score / maxScore) * 100) : 0}%
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">En Yüksek Seri</p>
                  <p className="text-3xl font-bold text-purple-600">{streak}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Süre</p>
                  <p className="text-3xl font-bold text-orange-600">{timeElapsed}s</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/student/games" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Oyunlara Dön
                  </Button>
                </Link>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Tekrar Oyna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
