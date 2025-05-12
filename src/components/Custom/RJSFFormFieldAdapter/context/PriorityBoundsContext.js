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

// Observer pattern for polygon updates
export const polygonObservers = [];

// Register a callback to be notified of polygon changes
export const registerObserver = (callback) => {
  if (typeof callback === "function") {
    polygonObservers.push(callback);
    return () => {
      const index = polygonObservers.indexOf(callback);
      if (index > -1) polygonObservers.splice(index, 1);
    };
  }
  return () => {};
};

// Notify all observers of a polygon change
export const notifyPolygonChange = (priorityType) => {
  polygonObservers.forEach((observer) => {
    if (typeof observer === "function") {
      observer(priorityType);
    }
  });
};

// Global store for feature groups to ensure they're shared between instances
export const globalFeatureGroups = {};

// Make feature groups available globally for interop
if (typeof window !== "undefined") {
  window.globalFeatureGroups = globalFeatureGroups;
}

// Create a context for sharing priority bounds state
export const PriorityBoundsContext = createContext({
  currentPriority: "high",
});
