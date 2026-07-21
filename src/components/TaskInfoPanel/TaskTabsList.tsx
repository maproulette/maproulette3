import { BookOpen, Braces, GitCommit, MessageSquare } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useIntl } from '@/i18n'
import { tabTriggerClass } from '@/lib/taskConstants'

interface TaskTabsListProps {
  commentsCount: number
  osmHistoryCount: number
}

export const TaskTabsList = ({ commentsCount, osmHistoryCount }: TaskTabsListProps) => {
  const { t } = useIntl()
  return (
    <div className="shrink-0 border-zinc-200 border-b dark:border-slate-700">
      <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
        <TabsTrigger value="task" className={tabTriggerClass}>
          <BookOpen className="h-3.5 w-3.5" />
          <span className="text-xs">{t('common.instructions', undefined, 'Instructions')}</span>
        </TabsTrigger>
        <TabsTrigger value="properties" className={tabTriggerClass}>
          <Braces className="h-3.5 w-3.5" />
          <span className="text-xs">
            {t('taskInfoPanel.tabs.properties', undefined, 'Properties')}
          </span>
        </TabsTrigger>
        <TabsTrigger value="comments" className={tabTriggerClass}>
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-xs">
            {t('taskInfoPanel.tabs.comments', { count: commentsCount }, 'Comments ({count})')}
          </span>
        </TabsTrigger>
        <TabsTrigger value="osm" className={tabTriggerClass}>
          <GitCommit className="h-3.5 w-3.5" />
          <span className="text-xs">
            {t('taskInfoPanel.tabs.osm', { count: osmHistoryCount }, 'OSM ({count})')}
          </span>
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
