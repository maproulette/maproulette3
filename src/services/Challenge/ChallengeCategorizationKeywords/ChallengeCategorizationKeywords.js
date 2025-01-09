/**
 * Determines if the given challenge passes the given categorization keywords filter.
 */
export const challengePassesCategorizationKeywordsFilter = function (filter, challenge) {
  let passing = true;
  if (Array.isArray(filter.categorizationKeywords)) {
    filter.categorizationKeywords.map((key) => {
      if (!challenge.tags?.includes(key)) {
        passing = false;
      }
    });
  }

  return passing;
};
