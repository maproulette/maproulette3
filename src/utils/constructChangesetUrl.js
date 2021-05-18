export const constructChangesetUrl = (task) => {
  if (
    process.env.REACT_APP_CHANGESET_URL === "enabled" &&
    task?.parent?.id &&
    task.parent.changesetUrl
  ) {
    return ` ${window.location.origin}/browse/challenges/${task.parent.id}`;
  } else {
    return "";
  }
};
