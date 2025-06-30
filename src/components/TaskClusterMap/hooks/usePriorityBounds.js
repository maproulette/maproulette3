import { useMemo } from "react";
import { processPriorityBounds } from "../utils/boundsProcessing";

/**
 * Custom hook to process priority bounds from challenge data
 */
export const usePriorityBounds = (challenge) => {
  const priorityBounds = useMemo(() => {
    if (!challenge) return [];

    const bounds = [
      ...processPriorityBounds(challenge.highPriorityBounds, 0),
      ...processPriorityBounds(challenge.mediumPriorityBounds, 1),
      ...processPriorityBounds(challenge.lowPriorityBounds, 2),
    ];

    // Add task counts to bounds
    return bounds.map((bound) => ({
      ...bound,
      count: getCountForPriority(challenge, bound.priorityLevel),
    }));
  }, [challenge]);

  return {
    priorityBounds,
    priorityBoundsCount: priorityBounds.length,
    hasPriorityBounds: priorityBounds.length > 0,
  };
};

const getCountForPriority = (challenge, level) => {
  switch (level) {
    case 0:
      return challenge.highPriorityCount || null;
    case 1:
      return challenge.mediumPriorityCount || null;
    case 2:
      return challenge.lowPriorityCount || null;
    default:
      return null;
  }
};

export default usePriorityBounds;
