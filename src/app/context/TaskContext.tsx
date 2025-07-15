"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Task } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader } from "../components";
import { useParams } from "next/navigation";
import { executeApiRequest } from "../utils/apiErrorHandler";

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

  const startTask = useCallback(async (): Promise<string | null> => {
    const taskData = await executeApiRequest(
      () => api.task.start(Number(taskId)),
      {
        on401: logout,
        setData: (data) => setTask(data as Task | null),
        setIsLoading,
        onError: (error) => console.error("Failed to start task:", error),
      }
    );

    return taskData?.id?.toString() || null;
  }, [taskId, logout]);

  useEffect(() => {
    if (taskId && !hasStarted) {
      setHasStarted(true);
      startTask();
    }
  }, [taskId, hasStarted, startTask]);

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
