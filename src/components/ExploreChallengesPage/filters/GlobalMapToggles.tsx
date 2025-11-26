import { useId } from 'react'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

interface GlobalToggleProps {
  global: boolean | undefined
  onGlobalChange: (checked: boolean) => void
}

export const GlobalToggle = ({ global, onGlobalChange }: GlobalToggleProps) => {
  const globalId = useId()

  return (
    <Label htmlFor={globalId} className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
      <Switch id={globalId} checked={global} onCheckedChange={onGlobalChange} />
      <span className="text-sm text-zinc-700 dark:text-zinc-300">Global</span>
    </Label>
  )
}
