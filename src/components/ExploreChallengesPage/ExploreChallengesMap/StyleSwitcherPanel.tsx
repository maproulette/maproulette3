import { Button } from '@/components/ui/Button'
import { mapStyleItems } from '@/utils/mapStyles'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

interface StyleSwitcherPanelProps {
  isOpen: boolean
}

export const StyleSwitcherPanel = ({ isOpen }: StyleSwitcherPanelProps) => {
  const { changeMapStyle, currentStyleId } = useExploreChallengesMapContext()

  const handleStyleSelect = (styleItem: (typeof mapStyleItems)[0]) => {
    changeMapStyle(styleItem)
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-4 right-14 z-[100] w-[280px] rounded-lg border border-zinc-200 bg-white shadow-xl md:right-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="max-h-[70vh] overflow-y-auto p-1.5">
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
  )
}
