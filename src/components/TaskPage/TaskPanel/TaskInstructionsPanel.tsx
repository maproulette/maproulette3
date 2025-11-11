import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { cn } from '@/lib/utils'

export const TaskInstructionsPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { challenge } = useChallengeContext()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <CardTitle className="font-semibold text-sm">Instructions</CardTitle>
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
              {challenge?.instruction && (
                <div className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
                  <p>{challenge.instruction}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  )
}
