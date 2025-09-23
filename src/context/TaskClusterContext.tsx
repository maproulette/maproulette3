import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { TaskCluster, TaskClusterParams } from '../types';
import { TASK_CLUSTER_KEY } from '../types/TaskCluster';
import { api, useApiQuery } from '../utils';

type TaskClusterContextType = {
  taskClusters: TaskCluster[];
  isLoading: boolean;
  error: Error | null;
  updateBounds: (bounds: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  }) => void;
  updateChallengeId: (challengeId: number) => void;
  updatePoints: (points: number) => void;
};

type TaskClusterContextTypeInternal = TaskClusterContextType & {
  setChallengeId: (id: number | undefined) => void;
  setBounds: (
    bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number } | null
  ) => void;
  setPoints: (points: number) => void;
};

const TaskClusterContext = createContext<TaskClusterContextTypeInternal | undefined>(undefined);

interface TaskClusterProviderProps {
  children: ReactNode;
}

export const useTaskClusterQuery = (params?: TaskClusterParams) => {
  return useApiQuery({
    queryKey: params ? TASK_CLUSTER_KEY(params) : ['taskCluster', 'undefined'],
    queryFn: async (): Promise<TaskCluster[]> => {
      if (!params) {
        throw new Error('TaskCluster parameters are required');
      }
      const response = await api.get<TaskCluster[]>(api.taskCluster.get(params));
      return response.data;
    },
    enabled: !!params,
  });
};

export const TaskClusterProvider: React.FC<TaskClusterProviderProps> = ({ children }) => {
  const [challengeId, setChallengeId] = useState<number | undefined>(undefined);
  const [bounds, setBounds] = useState<{
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  } | null>(null);
  const [points, setPoints] = useState<number>(25);

  // Debounced bounds update to prevent too many API calls
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedSetBounds = useCallback(
    (newBounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setBounds(newBounds);
      }, 500); // 500ms debounce
    },
    []
  );

  // Create params object for the API call
  const params: TaskClusterParams | undefined =
    challengeId && bounds
      ? {
          ca: true,
          cid: challengeId,
          points,
          tbb: `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`,
        }
      : undefined;

  const { data: taskClusters = [], isLoading, error } = useTaskClusterQuery(params);

  // Debug bounds changes (commented out to prevent console spam)
  // useEffect(() => {
  //   if (bounds) {
  //     console.log('Bounds updated:', bounds);
  //   }
  // }, [bounds]);

  // Debug params changes (commented out to prevent console spam)
  // useEffect(() => {
  //   if (params) {
  //     console.log('TaskCluster params updated:', params);
  //   }
  // }, [params]);

  const value: TaskClusterContextTypeInternal = {
    taskClusters,
    isLoading,
    error: error as Error | null,
    setChallengeId,
    setBounds,
    setPoints,
    updateBounds: debouncedSetBounds,
    updateChallengeId: setChallengeId,
    updatePoints: setPoints,
  };

  return <TaskClusterContext.Provider value={value}>{children}</TaskClusterContext.Provider>;
};

export const useTaskCluster = (challengeId?: number | string): TaskClusterContextType => {
  const context = useContext(TaskClusterContext);
  if (context === undefined) {
    throw new Error('useTaskCluster must be used within a TaskClusterProvider');
  }

  useEffect(() => {
    if (challengeId) {
      context.setChallengeId(Number(challengeId));
    }
  }, [challengeId, context.setChallengeId]);

  return {
    taskClusters: context.taskClusters,
    isLoading: context.isLoading,
    error: context.error,
    updateBounds: context.updateBounds,
    updateChallengeId: context.updateChallengeId,
    updatePoints: context.updatePoints,
  };
};

export { TaskClusterContext };
