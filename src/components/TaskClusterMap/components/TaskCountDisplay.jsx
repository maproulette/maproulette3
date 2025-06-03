import { FormattedMessage } from "react-intl";
import messages from "../Messages";
import { UNCLUSTER_THRESHOLD } from "../TaskClusterMap";

/**
 * Displays task count and control elements
 */
const TaskCountDisplay = ({
  mapZoomedOut,
  totalTaskCount,
  delayMapLoad,
  forceMapLoad,
  onClickFetchClusters,
  showAsClusters,
  toggleShowAsClusters,
  resetSelectedClusters,
  loading,
  createTaskBundle,
  searchOpen,
}) => {
  return (
    <>
      {/* Task clustering toggle */}
      {totalTaskCount &&
        totalTaskCount <= UNCLUSTER_THRESHOLD &&
        !searchOpen &&
        !loading &&
        !createTaskBundle && (
          <label
            htmlFor="show-clusters-input"
            className="mr-absolute mr-z-10 mr-top-0 mr-left-0 mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center"
          >
            <input
              id="show-clusters-input"
              type="checkbox"
              className="mr-mr-2"
              checked={showAsClusters}
              onChange={() => {
                // Clear any existing selections when switching between tasks and clusters
                toggleShowAsClusters();
                resetSelectedClusters && resetSelectedClusters();
              }}
            />
            <FormattedMessage {...messages.clusterTasksLabel} />
          </label>
        )}

      {/* Move map to refresh message */}
      {delayMapLoad && !searchOpen && !window.env.REACT_APP_DISABLE_TASK_CLUSTERS && (
        <div
          className="mr-absolute mr-top-0 mr-mt-3 mr-w-full mr-flex mr-justify-center"
          onClick={() => forceMapLoad()}
        >
          <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
            <div className="mr-py-2 mr-px-3 mr-text-center mr-cursor-pointer">
              <FormattedMessage {...messages.moveMapToRefresh} />
            </div>
          </div>
        </div>
      )}

      {/* Refresh tasks button */}
      {window.env.REACT_APP_DISABLE_TASK_CLUSTERS && onClickFetchClusters && !mapZoomedOut && (
        <div
          className="mr-absolute mr-bottom-0 mr-mb-3 mr-w-full mr-flex mr-justify-center"
          onClick={() => {
            onClickFetchClusters();
          }}
        >
          <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
            <div className="mr-py-2 mr-px-3 mr-text-center mr-cursor-pointer">
              <FormattedMessage {...messages.refreshTasks} />
            </div>
          </div>
        </div>
      )}

      {/* Task count display */}
      {!mapZoomedOut && (
        <div className="mr-absolute mr-top-0 mr-mt-3 mr-z-5 mr-w-full mr-flex mr-justify-center mr-pointer-events-none">
          <div className="mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
            <div className="mr-py-2 mr-px-3 mr-text-center">
              <FormattedMessage {...messages.taskCountLabel} values={{ count: totalTaskCount }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCountDisplay;
