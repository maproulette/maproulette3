export const constructChangesetUrl = (task) => {
  if (
    process.env.REACT_APP_CHANGESET_URL === "enabled" &&
    task.parent.changesetUrl
  ) {
    return ` ${window.location.origin}challenge/${task.parent.id}`;
  } else {
    return "";
  }
};
