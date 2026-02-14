import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Star } from "lucide-react"
import Link from "next/link"

interface GameListItemProps {
  game: any
}

export function GameListItem({ game }: GameListItemProps) {
  const disabilityNames: Record<string, string> = {
    disleksi: "Disleksi",
    dyslexia: "Disleksi",
    diskalkuli: "Diskalkuli",
    dyscalculia: "Diskalkuli",
    adhd: "ADHD",
    disgrafya: "Disgrafya",
    dysgraphia: "Disgrafya",
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-8 h-8 text-primary/50" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate">{game.title}</h3>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{game.description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {game.duration_minutes || 15} dk
              </div>

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
          </div>

          <Button asChild size="sm">
            <Link href={`/student/games/${game.id}/play`}>Oyna</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
