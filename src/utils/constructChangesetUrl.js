export const constructChangesetUrl = (task) => {
  if (
    process.env.REACT_APP_CHANGESET_URL === "enabled" &&
    task?.parent?.id &&
    task?.parent?.enabled &&
    task?.parent?.parent?.enabled
  ) {
    return ` ${window.location.origin}/browse/challenges/${task.parent.id}`;
  } else {
    return "";
  }
};
