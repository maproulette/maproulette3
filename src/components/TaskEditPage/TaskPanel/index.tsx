import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useProjectContext } from '../contexts/ProjectContext'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { SelectedDataPanel } from './SelectedDataPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'

export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()
  const { task } = useTaskContext()
  const { selectedMarker } = useTaskMapContext()
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

  // When a marker is selected, show only the SelectedDataPanel
  if (selectedMarker) {
    return (
      <div className="w-full border-zinc-200 border-r bg-background md:h-[calc(100vh-11rem)] dark:border-zinc-800">
        <ScrollArea className="h-full">
          <div className="p-4">
            <SelectedDataPanel />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-full border-zinc-200 border-r bg-background md:h-[calc(100vh-11rem)] dark:border-zinc-800">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full [&_[data-radix-scroll-area-viewport]]:snap-y [&_[data-radix-scroll-area-viewport]]:snap-mandatory [&_[data-radix-scroll-area-viewport]]:scroll-smooth"
      >
        <div className="space-y-4 p-4">
          {/* Snap point - Top */}
          <div className="snap-start snap-always" />

          {/* Challenge Title */}
          <div className="px-2">
            <h1 className="mb-1.5 font-bold text-xl text-zinc-900 dark:text-zinc-100">
              {challenge?.name}
            </h1>
            <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
              {project?.name || ''}
            </p>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

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
    </div>
  )
}
