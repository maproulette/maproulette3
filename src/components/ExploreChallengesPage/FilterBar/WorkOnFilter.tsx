import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import type { WorkOnCategory } from './filterTypes'

export const WorkOnFilter = () => {
  const { workOn, setWorkOn } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="whitespace-nowrap font-medium text-sm text-zinc-700 dark:text-zinc-300">Work on</Label>
      <Select value={workOn} onValueChange={(value) => setWorkOn(value as WorkOnCategory)}>
        <SelectTrigger className="h-9 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Anything">Anything</SelectItem>
          <SelectItem value="Roads / Pedestrian / Cycleways">
            Roads / Pedestrian / Cycleways
          </SelectItem>
          <SelectItem value="Water">Water</SelectItem>
          <SelectItem value="Points / Areas of Interest">Points / Areas of Interest</SelectItem>
          <SelectItem value="Buildings">Buildings</SelectItem>
          <SelectItem value="Land Use / Administrative Boundaries">
            Land Use / Administrative Boundaries
          </SelectItem>
          <SelectItem value="Transit">Transit</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
