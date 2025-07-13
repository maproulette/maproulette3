"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Task, ApiError } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader } from "../components";
import { useParams } from "next/navigation";

interface TaskContextType {
  task: Task | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { logout } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const { taskId } = useParams<{ taskId: string }>();

  const startTask = useCallback(async (): Promise<number | null> => {
    try {
      const response = await api.task.start(taskId);
      const taskData = response.data;

      if (taskData.id) {
        setTask(taskData);
        return taskData.id;
      } else {
        setTask(null);
        return null;
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        setTask(null);
        await logout();

        return null;
      } else {
        console.error("Failed to fetch user data:", error);
        setTask(null);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId && !hasStarted) {
      setHasStarted(true);
      startTask();
    }
  }, [taskId, hasStarted]);

  const value: TaskContextType = {
    task,
  };

  if (isLoading) return <Loader message="Loading task..." />;

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within an TaskProvider");
  }
  return context;
};

export { TaskContext };
