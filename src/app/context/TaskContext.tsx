"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Task } from "../types";
import { useParams } from "next/navigation";
import { Error as ErrorComponent, Loader } from "../components";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";

interface TaskContextType {
  task: Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const useTaskStart = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<Task> => {
      if (!taskId) {
        throw new Error("Project ID is required");
      }
      const response = await api.task.start(taskId);
      return response.data;
    },
    enabled: !!taskId,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const { logout } = useAuth();

  const { data, isLoading, error, refetch } = useTaskStart(taskId);

  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      logout();
    }
  }, [error, logout]);

  const value: TaskContextType = {
    task: data,
  };

  if (isLoading) return <Loader message="Loading task..." />;

  if (error) {
    return <ErrorComponent message="Error loading task" onRetry={refetch} />;
  }

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
