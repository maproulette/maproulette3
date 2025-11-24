import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  children?: React.ReactNode
}

export const StatCard = ({ title, value, subtitle, icon: Icon, children }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  )
}

