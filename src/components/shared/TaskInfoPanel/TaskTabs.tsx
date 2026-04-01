import { Tabs } from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { api } from '@/api'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { TabsContent } from '@/components/ui/Tabs'
import type { Task } from '@/types/Task'
import { CommentsHistoryTab } from './CommentsHistoryTab'
import { LocationTab } from './LocationTab'
import { OSMHistoryTab } from './OSMHistoryTab'
import { PropertiesTab } from './PropertiesTab'
import { TaskTabsList } from './TaskTabsList'

interface TaskTabsProps {
  task: Task
  /** Content rendered inside the "task" (Instructions) tab */
  taskTabContent?: ReactNode
  /** Whether to show the Location tab. Default: false */
  showLocationTab?: boolean
  /** Extra className applied to the content wrapper inside ScrollArea */
  contentClassName?: string
}

export const TaskTabs = ({
  task,
  taskTabContent,
  showLocationTab = false,
  contentClassName,
}: TaskTabsProps) => {
  const [activeTab, setActiveTab] = useState('task')
  const commentsQueryResult = api.task.getTaskComments(task.id)
  const commentsCount = commentsQueryResult.data?.length ?? 0
  const osmHistoryCount = task.changesetId && task.changesetId > 0 ? 1 : 0

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
      <TaskTabsList commentsCount={commentsCount} osmHistoryCount={osmHistoryCount} />

      <ScrollArea className="min-h-0 flex-1">
        <div className={contentClassName ?? 'p-4'}>
          <TabsContent value="task" className="mt-0">
            {taskTabContent}
          </TabsContent>
          <TabsContent value="properties" className="mt-0">
            <PropertiesTab task={task} />
          </TabsContent>
          <TabsContent value="comments" className="mt-0">
            <CommentsHistoryTab task={task} />
          </TabsContent>
          <TabsContent value="osm" className="mt-0">
            <OSMHistoryTab task={task} />
          </TabsContent>
          {showLocationTab && (
            <TabsContent value="location" className="mt-0">
              <LocationTab task={task} />
            </TabsContent>
          )}
        </div>
      </ScrollArea>
    </Tabs>
  )
}
