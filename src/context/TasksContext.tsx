import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils';

type TasksContextType = {
  getPrioritizedTasks: (challengeId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getPrioritizedTasks = async (challengeId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.challenge.prioritizedTasks(challengeId, false);
      const tasks = response.data;

      if (tasks && tasks.length > 0) {
        // Get the first task ID and navigate to it
        const firstTaskId = tasks[0].id;
        navigate(`/tasks/${firstTaskId}`);
      } else {
        setError('No tasks available for this challenge');
      }
    } catch (err) {
      console.error('Error fetching prioritized tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value: TasksContextType = {
    getPrioritizedTasks,
    isLoading,
    error,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export { TasksContext };
