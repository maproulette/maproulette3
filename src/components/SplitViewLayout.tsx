import { List, Map as MapIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/components/utils'

interface SplitViewLayoutProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  defaultView?: 'list' | 'map'
  showMobileTabs?: boolean
  leftPanelClassName?: string
  rightPanelClassName?: string
  containerClassName?: string
}

export const SplitViewLayout = ({
  leftPanel,
  rightPanel,
  defaultView = 'list',
  showMobileTabs = true,
  leftPanelClassName,
  rightPanelClassName,
  containerClassName,
}: SplitViewLayoutProps) => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>(defaultView)

  return (
    <>
      {showMobileTabs && (
        <div className="md:hidden">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'list' | 'map')}
            className="flex flex-col"
          >
            <div className="border-zinc-200 border-b bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
              <TabsList className="w-full">
                <TabsTrigger value="list">
                  <List />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapIcon />
                  <span>Map</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      )}

      <div className={cn('relative h-full md:flex', containerClassName)}>
        <div
          className={cn(
            'h-full md:block',
            showMobileTabs && activeTab === 'list' ? 'relative z-10' : 'invisible absolute inset-0',
            'md:visible md:relative md:z-auto',
            leftPanelClassName
          )}
        >
          {leftPanel}
        </div>

        <div
          className={cn(
            'h-full md:block md:flex-1',
            showMobileTabs && activeTab === 'map' ? 'relative z-10' : 'invisible absolute inset-0',
            'md:visible md:relative md:z-auto',
            rightPanelClassName
          )}
        >
          {rightPanel}
        </div>
      </div>
    </>
  )
}
