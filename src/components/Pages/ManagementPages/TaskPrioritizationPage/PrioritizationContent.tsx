import { createContext, useContext, useId, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { logger } from '@/lib/logger'
import { DefaultPrioritySelect } from './Editor/DefaultPrioritySelect'
import { PriorityTierPanel } from './Editor/PriorityTierPanel'
import { PreviewLegend } from './Preview/PreviewLegend'
import { PreviewMap } from './Preview/PreviewMap'
import { PreviewSummary } from './Preview/PreviewSummary'
import { type Tier, usePrioritizationContext } from './PrioritizationContext'

interface Props {
  challengeId: number
  challengeName?: string | null
}

const TIER_ORDER: Tier[] = ['high', 'medium', 'low']

interface PreviewMapBridgeValue {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
}

/**
 * Bridge context shares the Preview map's `MapRef` with the tier panels on the
 * left side so their bounds editors can attach terra-draw to the shared map
 * without prop-drilling through each tier.
 */
const PreviewMapBridgeContext = createContext<PreviewMapBridgeValue | null>(null)

export const usePreviewMapBridge = () => {
  const ctx = useContext(PreviewMapBridgeContext)
  if (!ctx) throw new Error('usePreviewMapBridge must be used within PrioritizationContent')
  return ctx
}

export const PrioritizationContent = ({ challengeId, challengeName }: Props) => {
  const { draft, isDirty, reset, markSaved } = usePrioritizationContext()
  const mutation = api.challenge.useUpdatePriorities()
  const [showOnlyChanged, setShowOnlyChanged] = useState(false)
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const changedSwitchId = useId()

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        challengeId,
        priorities: {
          defaultPriority: draft.defaultPriority,
          highPriorityRule: draft.high.rules ? JSON.stringify(draft.high.rules) : undefined,
          highPriorityBounds: draft.high.bounds ? JSON.stringify(draft.high.bounds) : undefined,
          mediumPriorityRule: draft.medium.rules ? JSON.stringify(draft.medium.rules) : undefined,
          mediumPriorityBounds: draft.medium.bounds
            ? JSON.stringify(draft.medium.bounds)
            : undefined,
          lowPriorityRule: draft.low.rules ? JSON.stringify(draft.low.rules) : undefined,
          lowPriorityBounds: draft.low.bounds ? JSON.stringify(draft.low.bounds) : undefined,
        },
      })
      markSaved()
      toast.success('Priorities saved')
    } catch (error) {
      logger.error('Priority save failed', { error, challengeId })
      toast.error('Could not save priorities')
      throw error
    }
  }

  return (
    <PreviewMapBridgeContext.Provider value={{ mapRef, mapLoaded }}>
      <div className="flex h-full flex-col gap-4 px-4 py-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="font-bold text-xl text-zinc-900 dark:text-slate-50">
              Task prioritization
            </h1>
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              {challengeName ?? `Challenge #${challengeId}`} — rules run top-down; the first tier to
              match wins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={reset}
              disabled={!isDirty || mutation.isPending}
            >
              Discard
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || mutation.isPending}
              aria-disabled={!isDirty || mutation.isPending}
            >
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </header>

        <DefaultPrioritySelect />

        <div className="grid min-h-[600px] flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
          <div className="space-y-3 overflow-y-auto pr-1">
            {TIER_ORDER.map((tier) => (
              <PriorityTierPanel key={tier} tier={tier} mapRef={mapRef} mapLoaded={mapLoaded} />
            ))}
          </div>
          <div className="flex min-h-[500px] flex-col gap-3">
            <div className="relative min-h-[400px] flex-1">
              <PreviewMap
                showOnlyChanged={showOnlyChanged}
                externalMapRef={mapRef}
                onMapLoaded={setMapLoaded}
              >
                {() => (
                  <div className="pointer-events-none absolute top-3 left-3 z-10">
                    <PreviewLegend />
                  </div>
                )}
              </PreviewMap>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={changedSwitchId}
                checked={showOnlyChanged}
                onCheckedChange={setShowOnlyChanged}
              />
              <Label htmlFor={changedSwitchId} className="font-normal text-xs">
                Show only tasks whose priority would change
              </Label>
            </div>
            <PreviewSummary />
          </div>
        </div>
      </div>
    </PreviewMapBridgeContext.Provider>
  )
}
