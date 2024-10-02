export const constructChangesetUrl = (task) => {
  if (
    import.meta.env.VITE_CHANGESET_URL === "enabled" &&
    task?.id &&
    task?.parent?.id &&
    task?.parent?.enabled &&
    task?.parent?.parent?.enabled
  ) {
    return ` ${constructTaskLink(task.parent.id, task.id)}`
  } else {
    return "";
  }
};

export const constructProjectLink = (projectId) => {
  const rootUrl = getRootUrl();
  const path = import.meta.env.VITE_SHORT_PATH === 'enabled' ? `/p/${projectId}` : `/browse/projects/${projectId}`

  return `${rootUrl}${path}`;
};

export const constructChallengeLink = (challengeId) => {
  const rootUrl = getRootUrl();
  const path = import.meta.env.VITE_SHORT_PATH === 'enabled' ? `/c/${challengeId}` : `/browse/challenges/${challengeId}`

  return `${rootUrl}${path}`;
};

export const constructTaskLink = (challengeId, taskId) => {
  const rootUrl = getRootUrl();
  const path = import.meta.env.VITE_SHORT_PATH === 'enabled' ? `/c/${challengeId}/t/${taskId}` : `/challenge/${challengeId}/task/${taskId}`

  return `${rootUrl}${path}`;
}

const getRootUrl = () => {
  return import.meta.env.VITE_SHORT_URL || window.location.origin
}
