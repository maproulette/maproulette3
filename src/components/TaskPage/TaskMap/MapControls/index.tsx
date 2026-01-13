import { TooltipProvider } from '@/components/ui/Tooltip'
import { StyleSwitcherPanel } from '../StyleSwitcherPanel'
import { ControlButtonsPanel } from './ControlButtonsPanel'
import { ToggleButton } from './ToggleButton'
import { useMapControls } from './useMapControls'

export const MapControls = () => {
  const {
    mapLoaded,
    task,
    isOpen,
    setIsOpen,
    isStylePanelOpen,
    showTaskFeatures,
    setShowTaskFeatures,
    showOSMData,
    handleToggleOSMData,
    showOSMElements,
    handleToggleOSMElement,
    osmElementOrder,
    setOsmElementOrder,
    osmDataLoading,
    dataLayerOrder,
    setDataLayerOrder,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleLayersClick,
    handleZoomToTask,
    showFirstSeparator,
    showSecondSeparator,
    showThirdSeparator,
  } = useMapControls()

  return (
    <TooltipProvider>
      <div className="absolute top-0 right-0 flex h-full items-start">
        <StyleSwitcherPanel
          isOpen={isStylePanelOpen}
          showTaskFeatures={showTaskFeatures}
          onToggleTaskFeatures={() => setShowTaskFeatures((prev) => !prev)}
          showOSMData={showOSMData}
          onToggleOSMData={handleToggleOSMData}
          showOSMElements={showOSMElements}
          onToggleOSMElement={handleToggleOSMElement}
          osmElementOrder={osmElementOrder}
          onReorderOSMElements={setOsmElementOrder}
          osmDataLoading={osmDataLoading}
          dataLayerOrder={dataLayerOrder}
          onReorderDataLayers={setDataLayerOrder}
        />

        <ToggleButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

        <ControlButtonsPanel
          isOpen={isOpen}
          mapLoaded={mapLoaded}
          task={task}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onLayersClick={handleLayersClick}
          onZoomToTask={handleZoomToTask}
          showFirstSeparator={showFirstSeparator}
          showSecondSeparator={showSecondSeparator}
          showThirdSeparator={showThirdSeparator}
        />
      </div>
    </TooltipProvider>
  )
}

