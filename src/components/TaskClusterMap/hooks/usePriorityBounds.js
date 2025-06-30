import { useMemo } from "react";
import { processPriorityBounds } from "../utils/boundsProcessing";

/**
 * Custom hook to process and prepare priority bounds from challenge data
 *
 * @param {Object} challenge - The challenge object containing priority bounds
 * @returns {Object} Processed bounds data and statistics
 */
export const usePriorityBounds = (challenge) => {
  const priorityBoundsCount = useMemo(() => {
    if (!challenge) return 0;

    let count = 0;
    count += challenge.highPriorityBounds?.length || 0;
    count += challenge.mediumPriorityBounds?.length || 0;
    count += challenge.lowPriorityBounds?.length || 0;

    return count;
  }, [challenge]);

  const priorityBounds = useMemo(() => {
    if (!challenge) return [];

    const highBounds = processPriorityBounds(challenge.highPriorityBounds, 0);
    const mediumBounds = processPriorityBounds(challenge.mediumPriorityBounds, 1);
    const lowBounds = processPriorityBounds(challenge.lowPriorityBounds, 2);

    const allBounds = [...highBounds, ...mediumBounds, ...lowBounds];

    return allBounds.map((bound) => {
      let count = null;
      if (bound.priorityLevel === 0) {
        count = challenge.highPriorityCount || null;
      } else if (bound.priorityLevel === 1) {
        count = challenge.mediumPriorityCount || null;
      } else if (bound.priorityLevel === 2) {
        count = challenge.lowPriorityCount || null;
      }

      return {
        ...bound,
        count,
      };
    });
  }, [challenge]);

  return {
    priorityBounds,
    priorityBoundsCount,
    hasPriorityBounds: priorityBoundsCount > 0,
  };
};

export default usePriorityBounds;
