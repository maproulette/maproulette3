import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { ButtonGroup } from '@/components/ui/ButtonGroup'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { useExtendedChallengesContext } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'

const Header = () => {
  const globalId = useId()
  const { extendedFindParams, setExtendedFindParams } = useSearchContext()
  const { setMapbounds } = useExtendedChallengesContext()

  const toggleShowOnMap = () => {
    if (extendedFindParams?.bounds) {
      setExtendedFindParams({ ...extendedFindParams, bounds: '-180,-90,180,90' })
    } else {
      setMapbounds()
    }
  }

  return (
    <div className="border-zinc-200 border-b p-6 dark:border-zinc-800">
      {/* Show on Map / Anywhere + Global Toggle */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <ButtonGroup className="shrink">
          <Button
            variant={extendedFindParams?.bounds ? 'default' : 'outline'}
            size="sm"
            onClick={toggleShowOnMap}
            className="text-xs"
          >
            Show on Map
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Anywhere
          </Button>
        </ButtonGroup>

        <Label htmlFor={globalId} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Switch
            id={globalId}
            checked={extendedFindParams?.global}
            onCheckedChange={(checked) =>
              setExtendedFindParams({ ...extendedFindParams, global: checked })
            }
          />
          <span className="text-xs">Global</span>
        </Label>
      </div>

      <Separator className="mb-4" />

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between gap-4">
        <Select
          value={extendedFindParams?.sortBy}
          onValueChange={(value: ExtendedFindParamsSortBy) =>
            setExtendedFindParams({
              ...extendedFindParams,
              sortBy: value,
            })
          }
        >
          <SelectTrigger className="h-9 w-40 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Default">Default</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Header
