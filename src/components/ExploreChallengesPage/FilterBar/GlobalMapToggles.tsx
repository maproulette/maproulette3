import { useId } from 'react'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'

export const GlobalToggle = () => {
  const { global, setGlobal } = useSearchContext()
  const globalId = useId()

  return (
    <Label htmlFor={globalId} className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
      <Switch id={globalId} checked={global} onCheckedChange={(checked) => setGlobal(checked)} />
      <span className="text-sm text-zinc-700 dark:text-zinc-300">Global</span>
    </Label>
  )
}
