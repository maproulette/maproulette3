export const challengePassesArchivedFilter = function (filter, challenge) {
  if (filter.archived === false) {
    return challenge.isArchived === false;
  }

  return true;
};
