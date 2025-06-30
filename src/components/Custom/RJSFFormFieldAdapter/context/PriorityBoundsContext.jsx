import { createContext } from "react";

export const priorityColors = {
  high: {
    base: "#FF0000",
    hover: "#FF3333",
    inactive: "#FF9999",
  },
  medium: {
    base: "#FFA500",
    hover: "#FFB733",
    inactive: "#FFCC99",
  },
  low: {
    base: "#008000",
    hover: "#33A033",
    inactive: "#99CC99",
  },
  default: {
    base: "#3388FF",
    hover: "#66A3FF",
    inactive: "#99CCFF",
  },
};

export const getColorForPriority = (priorityType, state = "base") => {
  const colors = priorityColors[priorityType] || priorityColors.default;
  return colors[state] || colors.base;
};

export const globalFeatureGroups = {};

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

if (typeof window !== "undefined") {
  window.globalFeatureGroups = globalFeatureGroups;
  window.resetPriorityFeatureGroup = resetFeatureGroup;
}

export const PriorityBoundsContext = createContext({
  currentPriority: "high",
  resetFeatureGroup,
});
