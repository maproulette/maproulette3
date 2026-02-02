import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import { BUNDLEABLE_STATUSES } from "../utils/bundleHelpers";

/**
 * Creates the expander column for row expansion
 */
export const createExpanderColumn = () => ({
  id: "expander",
  Cell: ({ row }) => <span {...row.getToggleRowExpandedProps()}>{row.isExpanded ? "▼" : "▶"}</span>,
  width: 40,
  disableSortBy: true,
  disableResizing: true,
});

/**
 * Creates the selected/checkbox column for task selection
 */
export const createSelectedColumn = (props) => ({
  id: "selected",
  accessor: (task) => props.isTaskSelected(task.id),
  Cell: ({ value, row }) => {
    const status = row.original.status ?? row.original.taskStatus;
    const alreadyBundled =
      row.original.bundleId && props.taskBundle?.bundleId !== row.original.bundleId;
    const enableSelecting =
      !props.task ||
      (!row.original.lockedBy &&
        !alreadyBundled &&
        !props.bundling &&
        !props.taskReadOnly &&
        BUNDLEABLE_STATUSES.includes(status) &&
        row.original.taskId !== props.task?.id &&
        props.workspace?.name !== "taskReview" &&
        !AsCooperativeWork(props.task).isTagType());

    if (
      props.highlightPrimaryTask &&
      row.original.id === props.task?.id &&
      !row.original.bundleId
    ) {
      return <span className="mr-text-green-lighter">✓</span>;
    }

    if (enableSelecting) {
      return (
        <input
          type="checkbox"
          className="mr-checkbox-toggle"
          checked={value}
          onChange={() => props.toggleTaskSelection(row.original)}
        />
      );
    }

    return null;
  },
  width: 40,
  disableSortBy: true,
  disableResizing: true,
});
