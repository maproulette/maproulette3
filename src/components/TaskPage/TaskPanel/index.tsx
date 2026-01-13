import { Info, List } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useProjectContext } from '../contexts/ProjectContext'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { MapDataTabs } from './MapDataTabs'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'

export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()
  const { task } = useTaskContext()
  const { map, mapLoaded } = useTaskMapContext()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const previousTaskIdRef = useRef(task.id)

  // Save scroll position before task changes
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')

    if (scrollElement) {
      const handleScroll = () => {
        setScrollPosition(scrollElement.scrollTop)
      }

      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Restore scroll position when task changes
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')

    if (scrollElement && previousTaskIdRef.current !== task.id) {
      // Restore the saved scroll position
      scrollElement.scrollTop = scrollPosition
      previousTaskIdRef.current = task.id
    }
  }, [task.id, scrollPosition])

  return (
    <div className="w-full border-zinc-200 border-r bg-background md:h-[calc(100vh-6rem)] dark:border-zinc-800">
      <Tabs defaultValue="details" className="flex h-full flex-col">
        <div className="border-zinc-200 border-b bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-100 dark:bg-zinc-900">
            <TabsTrigger
              value="details"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-100"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Task Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-100"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Map Data</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="flex-1 overflow-hidden">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full [&_[data-radix-scroll-area-viewport]]:snap-y [&_[data-radix-scroll-area-viewport]]:snap-mandatory [&_[data-radix-scroll-area-viewport]]:scroll-smooth"
          >
            <div className="space-y-4 p-4">
              {/* Snap point - Top */}
              <div className="snap-start snap-always" />

              {/* Challenge Title */}
              <div className="px-2">
                <h1 className="mb-1.5 font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  {challenge?.name}
                </h1>
                <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
                  {project?.name || ''}
                </p>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              {/* Instructions Panel */}
              <div className="snap-center">
                <TaskInstructionsPanel />
              </div>

              {/* Snap point - Middle */}
              <div className="snap-center">
                <ChallengeInfoPanel />
              </div>

              <div className="snap-end">
                <ProjectInfoPanel />
              </div>

              {/* Snap point - Bottom */}
              <div className="snap-end snap-always" />

              {/* Metrics Panel - Placeholder for future implementation */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 overflow-hidden">
          <MapDataTabs
            map={map}
            mapLoaded={mapLoaded}
            currentTaskId={task.id}
            challengeId={task.parent}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
