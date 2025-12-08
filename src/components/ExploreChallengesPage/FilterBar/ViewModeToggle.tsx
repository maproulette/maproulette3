import { LayoutGrid, List, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ButtonGroup } from '@/components/ui/ButtonGroup'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'

export const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useExploreChallengesSearchContext()
  return (
    <ButtonGroup>
      <Button
        variant={viewMode === 'grid-map' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('grid-map')}
        title="Grid with map view"
        className="h-9"
      >
        <MapIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('grid')}
        title="Grid view"
        className="h-9"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
        title="List view"
        className="h-9"
      >
        <List className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
