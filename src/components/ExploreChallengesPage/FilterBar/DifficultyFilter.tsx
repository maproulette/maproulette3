import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import type { DifficultyLevel } from './filterTypes'

export const DifficultyFilter = () => {
  const { difficulty, setDifficulty } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Difficulty</Label>
      <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
        <SelectTrigger className="h-9 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Any">Any</SelectItem>
          <SelectItem value="Easy">Easy</SelectItem>
          <SelectItem value="Normal">Normal</SelectItem>
          <SelectItem value="Expert">Expert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
