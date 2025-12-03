import { Info, List } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { useProjectContext } from '@/contexts/tasks/ProjectContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'
import { TasksTablePanel } from './TasksTablePanel'

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
    <div className="w-full border-gray-200 bg-gray-50 md:h-[calc(100vh-6rem)] dark:border-zinc-800 dark:bg-zinc-900">
      <Tabs defaultValue="details" className="flex h-full flex-col">
        <div className="border-gray-200 border-b bg-gray-100 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <TabsList>
            <TabsTrigger value="details">
              <Info />
              <span>Task Details</span>
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <List />
              <span>Map Data</span>
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
                <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-gray-100">
                  {challenge?.name}
                </h1>
                <p className="text-gray-600 text-sm dark:text-gray-400">{project?.name || ''}</p>
              </div>

              <Separator />

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
          <TasksTablePanel
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
