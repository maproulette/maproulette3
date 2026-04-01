import { Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTaskBundleContext } from '../TaskBundleContext'

export const BundleFilterToggle = () => {
  const { activeBundle, showBundleOnly, setShowBundleOnly } = useTaskBundleContext()

  if (!activeBundle) {
    return null
  }

  const bundleTaskCount = activeBundle.taskIds.length

  // Position above the ClusterToggle (which is at bottom-3 left-3)
  // Calculate approximate height: ClusterToggle card + spacing
  return (
    <div className="absolute bottom-[120px] left-3 z-[100] md:bottom-[140px] md:left-4">
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm md:bg-white md:p-3 dark:border-zinc-800 dark:bg-zinc-900/95 dark:md:bg-zinc-900">
        <Button
          variant={showBundleOnly ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-full gap-2"
          onClick={() => setShowBundleOnly(!showBundleOnly)}
          title={showBundleOnly ? 'Show all tasks' : 'Show only bundled tasks'}
        >
          <Package className="h-4 w-4" />
          <span className="font-medium text-xs">
            {showBundleOnly ? 'Show All Tasks' : `Show Bundle Only (${bundleTaskCount})`}
          </span>
        </Button>
      </div>
    </div>
  )
}
