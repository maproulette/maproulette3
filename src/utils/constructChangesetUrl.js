export const constructChangesetUrl = (task) => {
  if (task.parent.changesetUrl) {
    return ` ${window.location.origin}challenge/${task.parent.id}`;
  } else {
    return "";
  }
};
