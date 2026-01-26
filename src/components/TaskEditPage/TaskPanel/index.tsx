import { FileText, GitCommit, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useProjectContext } from '../contexts/ProjectContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { CommentsHistoryTab } from './CommentsHistoryTab'
import { OSMHistoryTab } from './OSMHistoryTab'
import { SelectedDataPanel } from './SelectedDataPanel'
import { TaskInfoTab } from './TaskInfoTab'

export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()
  const { selectedMarker } = useTaskMapContext()
  const [activeTab, setActiveTab] = useState('info')

  // When a marker is selected, show only the SelectedDataPanel
  if (selectedMarker) {
    return (
      <div className="flex w-full flex-col overflow-hidden border border-zinc-200 bg-white md:h-[calc(100vh-11rem)] md:rounded-r-none dark:border-zinc-800 dark:bg-zinc-950">
        <ScrollArea className="h-full">
          <div className="p-4">
            <SelectedDataPanel />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col overflow-hidden border border-zinc-200 bg-white md:h-[calc(100vh-11rem)] md:rounded-r-none dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 border-zinc-200 border-b px-4 pt-4 pb-3 dark:border-zinc-800">
        <h1 className="font-bold text-xl text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
          {challenge?.name}
        </h1>
        {project?.name && (
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {project.name}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-zinc-200 border-b px-4 dark:border-zinc-800">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">Task Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">Comments</span>
            </TabsTrigger>
            <TabsTrigger
              value="osm"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span className="text-xs">OSM History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            <TabsContent value="info" className="mt-0">
              <TaskInfoTab />
            </TabsContent>
            <TabsContent value="comments" className="mt-0">
              <CommentsHistoryTab />
            </TabsContent>
            <TabsContent value="osm" className="mt-0">
              <OSMHistoryTab />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
