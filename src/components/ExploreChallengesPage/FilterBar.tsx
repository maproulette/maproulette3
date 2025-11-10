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
import { Switch } from '@/components/ui/Switch'
import { useExtendedChallengesContext } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'

export const FilterBar = () => {
  const globalId = useId()
  const { extendedFindParams, setExtendedFindParams } = useSearchContext()
  const { setMapbounds } = useExtendedChallengesContext()

  const isMapBoundsActive = extendedFindParams?.bounds !== '-180,-90,180,90'

  const handleShowOnMap = () => {
    if (isMapBoundsActive) {
      
      setExtendedFindParams({ ...extendedFindParams, bounds: '-180,-90,180,90' })
    } else {
      
      setMapbounds()
    }
  }

  const handleAnywhere = () => {
    
    setExtendedFindParams({ ...extendedFindParams, bounds: '-180,-90,180,90' })
  }

  return (
    <div className="rounded-t-lg border-zinc-200 border-b bg-white px-4 py-3 md:px-6 md:py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        {/* Left Section: Location and Global Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          {/* Location Filter Buttons */}
          <ButtonGroup className="w-full md:w-auto">
            <Button
              variant={isMapBoundsActive ? 'default' : 'outline'}
              size="sm"
              onClick={handleShowOnMap}
              className="flex-1 text-xs md:flex-none"
              title={isMapBoundsActive ? 'Showing challenges in current map view' : 'Show challenges in map view'}
            >
              Map View
            </Button>
            <Button
              variant={!isMapBoundsActive ? 'default' : 'outline'}
              size="sm"
              onClick={handleAnywhere}
              className="flex-1 text-xs md:flex-none"
              title="Show challenges from anywhere"
            >
              Anywhere
            </Button>
          </ButtonGroup>

          {/* Global Switch */}
          <Label
            htmlFor={globalId}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Switch
              id={globalId}
              checked={extendedFindParams?.global}
              onCheckedChange={(checked) =>
                setExtendedFindParams({ ...extendedFindParams, global: checked })
              }
            />
            <span className="text-xs font-medium">Global Challenges</span>
          </Label>
        </div>

        {/* Right Section: Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-zinc-600 md:inline dark:text-zinc-400">Sort by:</span>
          <Select
            value={extendedFindParams?.sortBy}
            onValueChange={(value: ExtendedFindParamsSortBy) =>
              setExtendedFindParams({
                ...extendedFindParams,
                sortBy: value,
              })
            }
          >
            <SelectTrigger className="h-9 w-full md:w-40">
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
    </div>
  )
}
