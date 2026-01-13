import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { cn } from '@/lib/utils'
import { useProjectContext } from '../contexts/ProjectContext'

export const ProjectInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { project } = useProjectContext()

  if (!project) return null

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
              </div>
            </CardContent>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  )
}
