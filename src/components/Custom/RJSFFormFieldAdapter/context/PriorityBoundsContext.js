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

// Get color for a priority level and state
export const getColorForPriority = (priorityType, state = "base") => {
  const colors = priorityColors[priorityType] || priorityColors.default;
  return colors[state] || colors.base;
};

// Global store for feature groups to ensure they're shared between instances
export const globalFeatureGroups = {};

// Clean feature group by priority type
export const resetFeatureGroup = (priorityType) => {
  if (!priorityType) return;

  const groupKey = `priority-${priorityType}-feature-group`;

  if (globalFeatureGroups[groupKey]) {
    if (typeof globalFeatureGroups[groupKey].remove === "function") {
      globalFeatureGroups[groupKey].remove();
    }

    if (typeof globalFeatureGroups[groupKey].clearLayers === "function") {
      globalFeatureGroups[groupKey].clearLayers();
    }

    delete globalFeatureGroups[groupKey];
  }
};

// Make feature groups available globally for interop
if (typeof window !== "undefined") {
  window.globalFeatureGroups = globalFeatureGroups;
  window.resetPriorityFeatureGroup = resetFeatureGroup;
}

// Create a context for sharing priority bounds state
export const PriorityBoundsContext = createContext({
  currentPriority: "high",
  resetFeatureGroup,
});
