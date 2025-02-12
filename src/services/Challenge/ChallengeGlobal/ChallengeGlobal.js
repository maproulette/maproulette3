export const challengePassesGlobalFilter = function (filter, challenge) {
  if (location.pathname === "/browse/challenges" && !filter.global) {
    return challenge.isGlobal === false;
  }

  return true;
};
