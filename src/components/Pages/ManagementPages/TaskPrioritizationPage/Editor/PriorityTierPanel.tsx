import type { MapRef } from 'react-map-gl/maplibre'
import { TaskPropertyQueryBuilder } from '@/components/shared/TaskPropertyQueryBuilder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PRIORITY_LABEL, type TaskPriorityValue } from '@/types/Priority'
import { TIER_TO_PRIORITY, type Tier, usePrioritizationContext } from '../PrioritizationContext'
import { BoundsDrawControl } from './BoundsDrawControl'
import { TierMatchCount } from './TierMatchCount'
import { TierWarningBadges } from './TierWarningBadges'

const tierCardClass: Record<Tier, string> = {
  high: 'border-red-300 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30',
  medium: 'border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30',
  low: 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30',
}

interface Props {
  tier: Tier
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
}

export const PriorityTierPanel = ({ tier, mapRef, mapLoaded }: Props) => {
  const { draft, setTierRules, setTierBounds } = usePrioritizationContext()
  const priority: TaskPriorityValue = TIER_TO_PRIORITY[tier]
  const tierDraft = draft[tier]
  const boundsCount = tierDraft.bounds?.features?.length ?? 0

  return (
    <Card className={`border ${tierCardClass[tier]}`}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">{PRIORITY_LABEL[priority]} priority</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <TierMatchCount priority={priority} />
          <TierWarningBadges priority={priority} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TaskPropertyQueryBuilder
          value={tierDraft.rules}
          onChange={(next) => setTierRules(tier, next)}
        />
        <div className="space-y-2 rounded-md border border-zinc-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-zinc-600 dark:text-slate-300">
              Bounds ({boundsCount} polygon{boundsCount === 1 ? '' : 's'})
            </span>
            <BoundsDrawControl
              tier={tier}
              map={mapRef}
              mapLoaded={mapLoaded}
              value={tierDraft.bounds}
              onChange={(next) => setTierBounds(tier, next)}
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            Draw on the preview map to scope this tier spatially. Polygon = freeform; Rectangle =
            drag a box. Bounds are ANDed with the rule builder above.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
