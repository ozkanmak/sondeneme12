import { Card } from "@/components/ui/card"

interface AchievementBadgeProps {
  icon: string
  name: string
  description: string
  unlocked: boolean
}

export function AchievementBadge({ icon, name, description, unlocked }: AchievementBadgeProps) {
  return (
    <Card
      className={`p-4 text-center ${unlocked ? "bg-gradient-to-br from-yellow-100 to-yellow-50" : "bg-gray-100 opacity-50"}`}
    >
      <div className="text-4xl mb-2">{unlocked ? icon : "🔒"}</div>
      <div className="font-bold text-sm">{name}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </Card>
  )
}
