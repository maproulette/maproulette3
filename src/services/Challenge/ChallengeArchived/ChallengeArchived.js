export const challengePassesArchivedFilter = function(filter, challenge) {
  if (!filter.archived) {
    return challenge.isArchived === false
  }

  return true
}
