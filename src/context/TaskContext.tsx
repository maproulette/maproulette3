import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorComponent, Loader } from '../components';
import type { Task } from '../types';
import { TASK_BY_ID_KEY } from '../types/Task';
import { api, useApiQuery, useApiQueryPublic } from '../utils';
import { useAuth } from './AuthContext';

interface TaskContextType {
  task: Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const useTaskStart = (taskId: string, isAuthenticated: boolean) => {
  return useApiQuery({
    queryKey: TASK_BY_ID_KEY(taskId),
    queryFn: async (): Promise<Task> => {
      const response = await api.task.start(taskId);
      return response.data;
    },
    enabled: !!taskId && isAuthenticated,
  });
};

export const useTaskGet = (taskId: string, isAuthenticated: boolean) => {
  return useApiQueryPublic({
    queryKey: TASK_BY_ID_KEY(taskId),
    queryFn: async (): Promise<Task> => {
      const response = await api.task.get(taskId);
      return response.data;
    },
    enabled: !!taskId && !isAuthenticated,
  });
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { taskId } = useParams<{ taskId: string }>();

  const { data: startedTask, isLoading, error, refetch } = useTaskStart(taskId || '', isAuthenticated);

  const {
    data: publicTask,
    isLoading: isLoadingPublicTask,
    error: errorPublicTask,
    refetch: refetchPublicTask,
  } = useTaskGet(taskId || '', isAuthenticated);

  if (!taskId) {
    return <ErrorComponent message="Task ID is required" />;
  }

  const value: TaskContextType = {
    task: startedTask || publicTask,
  };

  if (isLoading || isLoadingPublicTask) return <Loader message="Loading task..." />;

  if (error || errorPublicTask) {
    return (
      <ErrorComponent
        message="Error loading task"
        onRetry={isAuthenticated ? refetch : refetchPublicTask}
      />
    );
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider');
  }
  return context;
};

export { TaskContext };
