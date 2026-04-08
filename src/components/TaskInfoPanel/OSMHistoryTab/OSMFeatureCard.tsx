import { Box, ExternalLink } from 'lucide-react'
import type { OsmFeature } from '../taskUtils/osmUtils'

interface OSMFeatureCardProps {
  osmFeature: OsmFeature
  osmServer: string
}

export const OSMFeatureCard = ({ osmFeature, osmServer }: OSMFeatureCardProps) => {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-white">
        <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        OSM Feature
      </div>
      <div className="mt-3">
        <a
          href={`${osmServer}/${osmFeature.type}/${osmFeature.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-slate-800/50 dark:hover:bg-slate-800"
        >
          <div>
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {osmFeature.type}/{osmFeature.id}
            </div>
            <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
              View {osmFeature.type} on OpenStreetMap
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-zinc-400 dark:text-slate-500" />
        </a>
      </div>
    </div>
  )
}
