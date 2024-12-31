export const challengePassesGlobalFilter = function (filter, challenge) {
  if (!filter.global) {
    return challenge.isGlobal === false;
  }

  return true;
};
