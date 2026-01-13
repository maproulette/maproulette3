import { GripVertical } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { mapStyleItems } from '@/utils/mapStyles'
import { useTaskMapContext } from '../contexts/TaskMapContext'

export interface StyleSwitcherPanelProps {
  isOpen: boolean
  showTaskFeatures: boolean
  onToggleTaskFeatures: () => void
  showOSMData: boolean
  onToggleOSMData: () => void
  showOSMElements: {
    nodes: boolean
    ways: boolean
    areas: boolean
  }
  onToggleOSMElement: (element: 'nodes' | 'ways' | 'areas') => void
  osmElementOrder: ('nodes' | 'ways' | 'areas')[]
  onReorderOSMElements: (newOrder: ('nodes' | 'ways' | 'areas')[]) => void
  osmDataLoading: boolean
  dataLayerOrder: ('task-features' | 'osm-data')[]
  onReorderDataLayers: (newOrder: ('task-features' | 'osm-data')[]) => void
}

export const StyleSwitcherPanel = ({
  isOpen,
  showTaskFeatures,
  onToggleTaskFeatures,
  showOSMData,
  onToggleOSMData,
  showOSMElements,
  onToggleOSMElement,
  osmElementOrder,
  onReorderOSMElements,
  osmDataLoading,
  dataLayerOrder,
  onReorderDataLayers,
}: StyleSwitcherPanelProps) => {
  const { changeMapStyle, currentStyleId } = useTaskMapContext()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [draggedDataLayerIndex, setDraggedDataLayerIndex] = useState<number | null>(null)
  const [dragOverDataLayerIndex, setDragOverDataLayerIndex] = useState<number | null>(null)

  const handleStyleSelect = (styleItem: (typeof mapStyleItems)[0]) => {
    changeMapStyle(styleItem)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newOrder = [...osmElementOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, removed)
    onReorderOSMElements(newOrder)

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDataLayerDragStart = (index: number) => {
    setDraggedDataLayerIndex(index)
  }

  const handleDataLayerDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverDataLayerIndex(index)
  }

  const handleDataLayerDragLeave = () => {
    setDragOverDataLayerIndex(null)
  }

  const handleDataLayerDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedDataLayerIndex === null || draggedDataLayerIndex === dropIndex) {
      setDraggedDataLayerIndex(null)
      setDragOverDataLayerIndex(null)
      return
    }

    const newOrder = [...dataLayerOrder]
    const [removed] = newOrder.splice(draggedDataLayerIndex, 1)
    newOrder.splice(dropIndex, 0, removed)
    onReorderDataLayers(newOrder)

    setDraggedDataLayerIndex(null)
    setDragOverDataLayerIndex(null)
  }

  const handleDataLayerDragEnd = () => {
    setDraggedDataLayerIndex(null)
    setDragOverDataLayerIndex(null)
  }

  const elementLabels: Record<'nodes' | 'ways' | 'areas', string> = {
    nodes: 'Nodes',
    ways: 'Ways',
    areas: 'Areas',
  }

  const elementFeatureIds: Record<'nodes' | 'ways' | 'areas', string> = {
    nodes: 'osm-data-node',
    ways: 'osm-data-way',
    areas: 'osm-data-area',
  }

  const dataLayerConfigs: Array<{
    id: 'task-features' | 'osm-data'
    label: string
    featureId: string
  }> = [
    { id: 'task-features', label: 'Task Features', featureId: 'task-features' },
    { id: 'osm-data', label: 'OSM Data', featureId: 'osm-data' },
  ]

  if (!isOpen) return null

  return (
    <div className="absolute top-4 right-14 z-[100] w-[280px] rounded-lg border border-zinc-200 bg-white shadow-xl md:right-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="max-h-[70vh] overflow-y-auto p-1.5">
        <div className="mb-2">
          <div className="mb-1.5 px-2 py-1 font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
            Data Layers
          </div>
          <ul className="list-none space-y-1">
            {dataLayerOrder.map((layerId, index) => {
              const layerConfig = dataLayerConfigs.find((c) => c.id === layerId)
              if (!layerConfig) return null

              if (layerId === 'task-features') {
                return (
                  <li
                    key={layerId}
                    draggable
                    onDragStart={() => handleDataLayerDragStart(index)}
                    onDragOver={(e) => handleDataLayerDragOver(e, index)}
                    onDragLeave={handleDataLayerDragLeave}
                    onDrop={(e) => handleDataLayerDrop(e, index)}
                    onDragEnd={handleDataLayerDragEnd}
                    className={`flex w-full items-center justify-between rounded-md border border-zinc-200 p-2 dark:border-zinc-800 ${
                      draggedDataLayerIndex === index ? 'opacity-50' : ''
                    } ${dragOverDataLayerIndex === index ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <GripVertical className="h-4 w-4 flex-shrink-0 cursor-move text-zinc-400 dark:text-zinc-500" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {layerConfig.label}
                        </span>
                        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {layerConfig.featureId}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Switch checked={showTaskFeatures} onCheckedChange={onToggleTaskFeatures} />
                    </button>
                  </li>
                )
              }

              if (layerId === 'osm-data') {
                return (
                  <li
                    key={layerId}
                    draggable
                    onDragStart={() => handleDataLayerDragStart(index)}
                    onDragOver={(e) => handleDataLayerDragOver(e, index)}
                    onDragLeave={handleDataLayerDragLeave}
                    onDrop={(e) => handleDataLayerDrop(e, index)}
                    onDragEnd={handleDataLayerDragEnd}
                    className={`w-full rounded-md border border-zinc-200 dark:border-zinc-800 ${
                      draggedDataLayerIndex === index ? 'opacity-50' : ''
                    } ${dragOverDataLayerIndex === index ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                  >
                    <div className="flex items-center justify-between p-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <GripVertical className="h-4 w-4 flex-shrink-0 cursor-move text-zinc-400 dark:text-zinc-500" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {layerConfig.label}
                          </span>
                          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {layerConfig.featureId}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Switch
                          checked={showOSMData}
                          onCheckedChange={onToggleOSMData}
                          disabled={osmDataLoading}
                        />
                      </button>
                    </div>

                    {showOSMData && (
                      <ul className="list-none space-y-1 border-zinc-200 border-t px-2 py-1.5 dark:border-zinc-800">
                        {osmElementOrder.map((element, elementIndex) => (
                          <li
                            key={element}
                            draggable
                            onDragStart={() => handleDragStart(elementIndex)}
                            onDragOver={(e) => handleDragOver(e, elementIndex)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, elementIndex)}
                            onDragEnd={handleDragEnd}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 ${
                              draggedIndex === elementIndex ? 'opacity-50' : ''
                            } ${dragOverIndex === elementIndex ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <GripVertical className="h-3.5 w-3.5 flex-shrink-0 cursor-move text-zinc-400 dark:text-zinc-500" />
                              <span className="truncate font-medium text-xs text-zinc-700 dark:text-zinc-300">
                                {elementLabels[element]}
                              </span>
                              <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                ({elementFeatureIds[element]})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              <Switch
                                checked={showOSMElements[element]}
                                onCheckedChange={() => onToggleOSMElement(element)}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              }

              return null
            })}
          </ul>
        </div>

        <Separator className="my-2" />

        <div>
          <div className="mb-1.5 px-2 py-1 font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
            Basemap Styles
          </div>
          <div className="space-y-1">
            {mapStyleItems.map((style) => (
              <Button
                key={style.id}
                variant="outline"
                onClick={() => handleStyleSelect(style)}
                className={`h-auto w-full justify-start gap-2.5 rounded-md p-2 text-left ${
                  currentStyleId === style.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <img
                  src={style.image}
                  alt={style.name}
                  className="h-12 w-12 flex-shrink-0 rounded border border-zinc-200 object-cover dark:border-zinc-700"
                />
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`truncate font-medium text-sm ${
                      currentStyleId === style.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {style.name}
                  </span>
                  {style.description && (
                    <span className="truncate text-xs text-zinc-500 leading-tight dark:text-zinc-400">
                      {style.description}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
