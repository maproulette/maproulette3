import { Info, List } from 'lucide-react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useMapContext } from '@/contexts/MapContext'
import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { useProjectContext } from '@/contexts/tasks/ProjectContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'
import { TasksTablePanel } from './TasksTablePanel'

export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()
  const { task } = useTaskContext()
  const { map, mapLoaded } = useMapContext()

  return (
    <div className="md:h-[calc(100vh-11.4rem)] w-full border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900">
      <Tabs defaultValue="details" className="flex h-full flex-col">
        <div className="border-gray-200 border-b bg-gray-100 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <TabsList>
            <TabsTrigger value="details">
              <Info />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <List />
              <span>Visible Tasks</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {/* Challenge Title */}
              <div className="px-2">
                <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-gray-100">
                  {challenge?.name}
                </h1>
                <p className="text-gray-600 text-sm dark:text-gray-400">{project?.name || ''}</p>
              </div>

              <Separator />

              {/* Instructions Panel */}
              <TaskInstructionsPanel />
              <ChallengeInfoPanel />
              <ProjectInfoPanel />

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
