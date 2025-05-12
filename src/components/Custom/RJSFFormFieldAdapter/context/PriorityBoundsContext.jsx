import React, { createContext } from "react";
import L from "leaflet";

// Global feature groups (outside React) to maintain state across mounts
export const globalFeatureGroups = {};

// Global state for undo/redo history and initial values by priority type
export const globalBoundsState = {
  high: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
  medium: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
  low: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
};

// Create theme context
export const PriorityBoundsContext = createContext({
  currentPriority: "high",
});

// Get color by priority type and state
export const getColorForPriority = (priorityType, state = "base") => {
  const colors = {
    high: {
      base: "#FF0000", // Red
      hover: "#FF5252", // Lighter red
    },
    medium: {
      base: "#FF9800", // Orange
      hover: "#FFAB40", // Lighter orange
    },
    low: {
      base: "#FFEB3B", // Yellow
      hover: "#FFEE58", // Lighter yellow
    },
  };

  return colors[priorityType]?.[state] || colors.high.base;
};

// Reset feature group when component unmounts
export const resetFeatureGroup = (priorityType) => {
  const groupKey = `priority-${priorityType}-feature-group`;
  if (globalFeatureGroups[groupKey]) {
    globalFeatureGroups[groupKey].clearLayers();
    delete globalFeatureGroups[groupKey];
  }
};

// Initialize or get a feature group
export const getFeatureGroup = (priorityType) => {
  const groupKey = `priority-${priorityType}-feature-group`;

  if (!globalFeatureGroups[groupKey]) {
    globalFeatureGroups[groupKey] = new L.FeatureGroup();
  }

  return globalFeatureGroups[groupKey];
};

// Initialize global state for a priority type if the initial value hasn't been set yet
export const initializeGlobalState = (priorityType, initialValue) => {
  if (globalBoundsState[priorityType].initialValue === null) {
    globalBoundsState[priorityType].initialValue = initialValue ? [...initialValue] : [];
  }
};

// Save state to undo history
export const saveToUndoHistory = (priorityType, currentState) => {
  globalBoundsState[priorityType].undoHistory.push(currentState);
  globalBoundsState[priorityType].redoHistory = [];
};

// Get undo/redo state for a priority type
export const getHistoryState = (priorityType) => {
  return {
    undoHistory: globalBoundsState[priorityType].undoHistory,
    redoHistory: globalBoundsState[priorityType].redoHistory,
    canUndo: globalBoundsState[priorityType].undoHistory.length > 0,
    canRedo: globalBoundsState[priorityType].redoHistory.length > 0,
    initialValue: globalBoundsState[priorityType].initialValue,
  };
};

// Update undo/redo history
export const updateHistory = (priorityType, undoHistory, redoHistory) => {
  globalBoundsState[priorityType].undoHistory = undoHistory;
  globalBoundsState[priorityType].redoHistory = redoHistory;
};
