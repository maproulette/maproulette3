import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";

/**
 * Valid task statuses for bundling (Created=0, Skipped=3, TooHard=6)
 */
export const BUNDLEABLE_STATUSES = [0, 3, 6];

/**
 * Determines if a task can be selected for bundling
 *
 * @param {Object} task - The task to check
 * @param {Object} props - Component props containing bundle state
 * @returns {boolean} - Whether the task can be selected
 */
export const canSelectTask = (task, props) => {
  const status = task.status ?? task.taskStatus;
  const alreadyBundled = task.bundleId && props.taskBundle?.bundleId !== task.bundleId;

  return (
    !props.task ||
    (!task.lockedBy &&
      !alreadyBundled &&
      !props.bundling &&
      !props.taskReadOnly &&
      BUNDLEABLE_STATUSES.includes(status) &&
      task.taskId !== props.task?.id &&
      props.workspace?.name !== "taskReview" &&
      !AsCooperativeWork(props.task).isTagType())
  );
};

/**
 * Determines if a task is the primary/active task
 *
 * @param {Object} task - The task to check
 * @param {Object} props - Component props
 * @returns {boolean} - Whether this is the primary task
 */
export const isPrimaryTask = (task, props) => {
  return props.highlightPrimaryTask && task.id === props.task?.id && !task.bundleId;
};

/**
 * Determines if a task can be unbundled
 *
 * @param {Object} task - The task to check
 * @param {Object} props - Component props
 * @returns {boolean} - Whether the task can be unbundled
 */
export const canUnbundleTask = (task, props) => {
  const { taskBundle, initialBundle, user } = props;
  const { id: taskId, bundleId, status } = task;

  const isActiveTask = taskId === props.task?.id;
  const isInActiveBundle = taskBundle?.taskIds?.includes(taskId);
  const alreadyBundled = bundleId && initialBundle?.bundleId !== bundleId;
  const validBundlingStatus =
    initialBundle?.taskIds?.includes(taskId) || BUNDLEABLE_STATUSES.includes(status);
  const isLocked = task.lockedBy && task.lockedBy !== user?.id;

  return !isActiveTask && validBundlingStatus && isInActiveBundle && !alreadyBundled && !isLocked;
};

/**
 * Determines if a task can be added to a bundle
 *
 * @param {Object} task - The task to check
 * @param {Object} props - Component props
 * @returns {boolean} - Whether the task can be bundled
 */
export const canBundleTask = (task, props) => {
  const { taskBundle, initialBundle, user } = props;
  const { id: taskId, bundleId, status } = task;

  const isActiveTask = taskId === props.task?.id;
  const isInActiveBundle = taskBundle?.taskIds?.includes(taskId);
  const alreadyBundled = bundleId && initialBundle?.bundleId !== bundleId;
  const validBundlingStatus =
    initialBundle?.taskIds?.includes(taskId) || BUNDLEABLE_STATUSES.includes(status);
  const isLocked = task.lockedBy && task.lockedBy !== user?.id;

  return !isActiveTask && validBundlingStatus && !isInActiveBundle && !alreadyBundled && !isLocked;
};

/**
 * Get the bundle status for a task
 *
 * @param {Object} task - The task to check
 * @param {Object} props - Component props
 * @returns {Object} - Bundle status information
 */
export const getTaskBundleStatus = (task, props) => {
  const isActiveTask = task.id === props.task?.id;
  const isLocked = task.lockedBy && task.lockedBy !== props.user?.id;

  return {
    isActiveTask,
    isLocked,
    canUnbundle: canUnbundleTask(task, props),
    canBundle: canBundleTask(task, props),
  };
};
