import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useChallengeContext } from '../contexts/ChallengeContext'

export const ChallengeInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { challenge } = useChallengeContext()

  const { data: challengeStats } = api.challenge.getChallengeStats(challenge?.id ?? 0)

  if (!challenge) return null

  const stats = challengeStats?.[0]?.actions
  const tasksRemaining = stats?.available ?? challenge.tasksRemaining ?? 0
  const totalTasks = stats?.total ?? 0
  const completedTasks = totalTasks > 0 ? totalTasks - tasksRemaining : 0
  const completionPercentage =
    challenge.completionPercentage ??
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <CardTitle className="font-semibold text-sm">Challenge Information</CardTitle>
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
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{challenge.name}</h4>
                  <CardDescription className="text-xs">ID: {challenge.id}</CardDescription>
                </div>
                {challenge.description && (
                  <p className="text-gray-600 text-sm dark:text-gray-300">
                    {challenge.description}
                  </p>
                )}
                {challenge.blurb && (
                  <CardDescription className="text-xs">{challenge.blurb}</CardDescription>
                )}
                <Separator />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                      {getDifficultyLabel(challenge.difficulty)}
                    </div>
                    <CardDescription className="text-xs">Difficulty</CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                      {tasksRemaining}
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
