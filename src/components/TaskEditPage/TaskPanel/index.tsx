import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/ScrollArea'
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
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full [&_[data-radix-scroll-area-viewport]]:snap-y [&_[data-radix-scroll-area-viewport]]:snap-mandatory [&_[data-radix-scroll-area-viewport]]:scroll-smooth"
      >
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Snap point - Top */}
          <div className="snap-start snap-always" />

          {/* Challenge Title Header */}
          <div className="space-y-2">
            <h1 className="font-bold text-2xl text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
              {challenge?.name}
            </h1>
            {project?.name && (
              <p className="flex items-center gap-2 font-medium text-sm text-zinc-600 dark:text-zinc-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {project.name}
              </p>
            )}
          </div>

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
        </div>
      </ScrollArea>
    </div>
  )
}
