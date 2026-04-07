import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  iconColor: string
  borderColor: string
  valueColor: string
  descriptionIcon: LucideIcon
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  borderColor,
  valueColor,
  descriptionIcon: DescIcon,
}: StatsCardProps) => {
  return (
    <Card
      className={`group relative overflow-hidden border-2 ${borderColor} transition-all hover:scale-105 hover:shadow-xl`}
    >
      <div className="-translate-y-8 absolute top-0 right-0 h-24 w-24 translate-x-8 rounded-full" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-semibold text-sm">{title}</CardTitle>
        <div className="rounded-full p-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`font-bold text-3xl ${valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
          <DescIcon className="h-3 w-3" />
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
