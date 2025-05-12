import { createContext } from "react";

// Color constants for priority levels with state variants
export const priorityColors = {
  high: {
    base: "#FF0000", // Red
    hover: "#FF3333", // Lighter red
    inactive: "#FF9999", // Very light red
  },
  medium: {
    base: "#FFA500", // Orange
    hover: "#FFB733", // Lighter orange
    inactive: "#FFCC99", // Very light orange
  },
  low: {
    base: "#008000", // Green
    hover: "#33A033", // Lighter green
    inactive: "#99CC99", // Very light green
  },
  default: {
    base: "#3388FF", // Default blue
    hover: "#66A3FF", // Lighter blue
    inactive: "#99CCFF", // Very light blue
  },
};

/**
 * Get color for a priority level and state
 * @param {string} priorityType - The priority type (high, medium, low)
 * @param {string} state - The color state (base, hover, inactive)
 * @returns {string} The color value
 */
export const getColorForPriority = (priorityType, state = "base") => {
  const colors = priorityColors[priorityType] || priorityColors.default;
  return colors[state] || colors.base;
};

// Global store for feature groups to ensure they're shared between instances
export const globalFeatureGroups = {};

/**
 * Reset and clean up feature group by priority type
 * @param {string} priorityType - The priority type to reset
 */
export const resetFeatureGroup = (priorityType) => {
  if (!priorityType) return;

  const groupKey = `priority-${priorityType}-feature-group`;

  if (globalFeatureGroups[groupKey]) {
    try {
      // Remove from map if it's attached
      if (typeof globalFeatureGroups[groupKey].remove === "function") {
        globalFeatureGroups[groupKey].remove();
      }

      // Clear all layers
      if (typeof globalFeatureGroups[groupKey].clearLayers === "function") {
        globalFeatureGroups[groupKey].clearLayers();
      }

      // Delete from the global store
      delete globalFeatureGroups[groupKey];

      // Notify other components about the change
      window.dispatchEvent(new CustomEvent("mr:priority-bounds-changed"));
    } catch (error) {
      console.error(`Error resetting feature group for ${priorityType}:`, error);
    }
  }
};

/**
 * Reset all feature groups
 */
export const resetAllFeatureGroups = () => {
  Object.keys(globalFeatureGroups).forEach((key) => {
    const priorityType = key.replace(/^priority-(.+)-feature-group$/, "$1");
    resetFeatureGroup(priorityType);
  });
};

// Make feature groups available globally for interop
if (typeof window !== "undefined") {
  window.globalFeatureGroups = globalFeatureGroups;
  window.resetPriorityFeatureGroup = resetFeatureGroup;
  window.resetAllPriorityFeatureGroups = resetAllFeatureGroups;
}

// Create a context for sharing priority bounds state
export const PriorityBoundsContext = createContext({
  currentPriority: "high",
  resetFeatureGroup,
  resetAllFeatureGroups,
});
