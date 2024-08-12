export const challengePassesGlobalFilter = function(filter, challenge) {
  if (filter.filterGlobal) {
    return challenge.isGlobal === false
  }

  return true
}
