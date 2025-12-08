import { useId } from 'react'
import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

export const GlobalToggle = () => {
  const { global, setGlobal } = useExploreChallengesSearchContext()
  const globalId = useId()

  return (
    <Label htmlFor={globalId} className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
      <Switch
        id={globalId}
        checked={global ?? false}
        onCheckedChange={(checked) => setGlobal(checked)}
      />
      <span className="text-sm text-zinc-700 dark:text-zinc-300">Global</span>
    </Label>
  )
}
