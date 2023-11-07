export const constructChangesetUrl = (task) => {
  if (
    process.env.REACT_APP_CHANGESET_URL === "enabled" &&
    task?.id &&
    task?.parent?.id &&
    task?.parent?.enabled &&
    task?.parent?.parent?.enabled
  ) {
    const rootUrl = process.env.REACT_APP_SHORT_URL || window.location.origin
    const path = process.env.REACT_APP_SHORT_PATH === 'enabled' ? `/c/${task.parent.id}/t/${task.id}` : `/challenge/${task.parent.id}/task/${task.id}`

    return ` ${rootUrl}${path}`;
  } else {
    return "";
  }
};
