import MapControlsDrawer from "../MapControlsDrawer";
import usePriorityBounds from "../hooks/usePriorityBounds";
import useClusterSelection from "../hooks/useClusterSelection";

/**
 * Renders map controls and manages selection functionality
 */
const MapControls = ({
  isOpen,
  openSearch,
  handleToggleDrawer,
  showPriorityBounds,
  togglePriorityBounds,
  challenge,
  showAsClusters,
  resetSelectedClusters,
  resetSelectedTasks,
  onBulkTaskSelection,
  onBulkTaskDeselection,
  onBulkClusterSelection,
  onBulkClusterDeselection,
  ...props
}) => {
  // Use custom hooks for priority bounds and selection
  const { priorityBounds, priorityBoundsCount } = usePriorityBounds(challenge);

  const {
    selectTasksInLayers,
    deselectTasksInLayers,
    selectClustersInLayers,
    deselectClustersInLayers,
    selectAllTasksInView,
    selectAllClustersInView,
  } = useClusterSelection(
    onBulkTaskSelection,
    onBulkTaskDeselection,
    onBulkClusterSelection,
    onBulkClusterDeselection,
  );

  return (
    <MapControlsDrawer
      isOpen={isOpen}
      openSearch={openSearch}
      handleToggleDrawer={handleToggleDrawer}
      deselectTasksInLayers={deselectTasksInLayers}
      selectTasksInLayers={selectTasksInLayers}
      selectClustersInLayers={selectClustersInLayers}
      deselectClustersInLayers={deselectClustersInLayers}
      onLassoClear={resetSelectedClusters || resetSelectedTasks}
      onLassoSelection={showAsClusters ? selectClustersInLayers : selectTasksInLayers}
      onLassoDeselection={showAsClusters ? deselectClustersInLayers : deselectTasksInLayers}
      onSelectAllInView={showAsClusters ? selectAllClustersInView : selectAllTasksInView}
      onBulkClusterSelection={onBulkClusterSelection}
      priorityBounds={priorityBounds}
      showPriorityBounds={showPriorityBounds}
      togglePriorityBounds={togglePriorityBounds}
      priorityBoundsCount={priorityBoundsCount}
      {...props}
    />
  );
};

export default MapControls;
