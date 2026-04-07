import { useId } from 'react'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

interface FilterToggleProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  icon?: React.ComponentType<{ className?: string }>
}

export const FilterToggle = ({
  label,
  checked,
  onCheckedChange,
  icon: Icon,
}: FilterToggleProps) => {
  const id = useId()

  return (
    <Label htmlFor={id} className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
    </Label>
  )
}
