import { BookOpen, Braces, GitCommit, MessageSquare } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { tabTriggerClass } from './taskConstants'

interface TaskTabsListProps {
  commentsCount: number
  osmHistoryCount: number
}

export const TaskTabsList = ({ commentsCount, osmHistoryCount }: TaskTabsListProps) => (
  <div className="shrink-0 border-zinc-200 border-b dark:border-zinc-800">
    <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
      <TabsTrigger value="task" className={tabTriggerClass}>
        <BookOpen className="h-3.5 w-3.5" />
        <span className="text-xs">Instructions</span>
      </TabsTrigger>
      <TabsTrigger value="properties" className={tabTriggerClass}>
        <Braces className="h-3.5 w-3.5" />
        <span className="text-xs">Properties</span>
      </TabsTrigger>
      <TabsTrigger value="comments" className={tabTriggerClass}>
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-xs">Comments ({commentsCount})</span>
      </TabsTrigger>
      <TabsTrigger value="osm" className={tabTriggerClass}>
        <GitCommit className="h-3.5 w-3.5" />
        <span className="text-xs">OSM ({osmHistoryCount})</span>
      </TabsTrigger>
    </TabsList>
  </div>
)
