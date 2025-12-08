import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import type { WorkOnCategory } from './filterTypes'

export const WorkOnFilter = () => {
  const { workOn, setWorkOn } = useSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Work On:</Label>
      <Select value={workOn} onValueChange={(value) => setWorkOn(value as WorkOnCategory)}>
        <SelectTrigger className="h-9 w-28 border-zinc-300 dark:border-zinc-700">
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
