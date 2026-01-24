import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'
import { useProjectContext } from '../contexts/ProjectContext'

export const ProjectInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { project } = useProjectContext()

  const { data: projectStats } = api.project.getProjectStats(project?.id)

  const { data: projectChallenges } = api.project.getProjectChallenges(project?.id, 100, 0)

  if (!project) return null

  const challengesCount = projectChallenges?.length || 0
  const totalTasks = projectStats?.actions?.total || 0
  const availableTasks = projectStats?.actions?.available || 0
  const completedTasks = totalTasks - availableTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const incompleteChallenges =
    projectChallenges?.filter(
      (challenge) =>
        (challenge.tasksRemaining && challenge.tasksRemaining > 0) ||
        (challenge.completionPercentage !== undefined &&
          challenge.completionPercentage !== null &&
          challenge.completionPercentage < 100)
    ).length || 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <CardTitle className="font-semibold text-sm">Project Information</CardTitle>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-500 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </CardHeader>
        </CollapsibleTrigger>
        {isOpen && (
          <CollapsibleContent>
            <CardContent className="px-4 py-3">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h4>
                  <CardDescription className="text-xs">ID: {project.id}</CardDescription>
                </div>
                {project.description && (
                  <p className="text-gray-600 text-sm dark:text-gray-300">{project.description}</p>
                )}
                {project.displayName && (
                  <CardDescription className="text-xs">{project.displayName}</CardDescription>
                )}
                <Separator />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                      {challengesCount}
                    </div>
                    <CardDescription className="text-xs">Challenges</CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                      {incompleteChallenges}
                    </div>
                    <CardDescription className="text-xs">Remaining</CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                      {completionPercentage}%
                    </div>
                    <CardDescription className="text-xs">Complete</CardDescription>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  )
}
