import { createContext, useContext, useState, useCallback } from "react";

// Context for sharing priority bounds data across all priority fields
const PriorityBoundsDataContext = createContext({
  priorityBoundsData: {
    highPriorityBounds: [],
    mediumPriorityBounds: [],
    lowPriorityBounds: [],
  },
  updatePriorityBounds: () => {},
});

// Provider component
export const PriorityBoundsDataProvider = ({ children, initialData = {} }) => {
  const [priorityBoundsData, setPriorityBoundsData] = useState({
    highPriorityBounds: initialData.highPriorityBounds || [],
    mediumPriorityBounds: initialData.mediumPriorityBounds || [],
    lowPriorityBounds: initialData.lowPriorityBounds || [],
  });

  const updatePriorityBounds = useCallback((priorityType, bounds) => {
    setPriorityBoundsData((prev) => ({
      ...prev,
      [`${priorityType}PriorityBounds`]: bounds,
    }));
  }, []);

  const value = {
    priorityBoundsData,
    updatePriorityBounds,
  };

  return (
    <PriorityBoundsDataContext.Provider value={value}>
      {children}
    </PriorityBoundsDataContext.Provider>
  );
};

// Hook to use the context
export const usePriorityBoundsData = () => {
  const context = useContext(PriorityBoundsDataContext);
  if (!context) {
    throw new Error("usePriorityBoundsData must be used within a PriorityBoundsDataProvider");
  }
  return context;
};

export default PriorityBoundsDataContext;
