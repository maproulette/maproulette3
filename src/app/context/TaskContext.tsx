"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Task } from "../types";
import { useParams } from "next/navigation";
import { Error as ErrorComponent, Loader } from "../components";
import { useApiQuery } from "../utils/useApiQuery";
import { api } from "../utils/api";

interface TaskContextType {
  task: Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const useTaskStart = (taskId: string) => {
  return useApiQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<Task> => {
      const response = await api.task.start(taskId);
      return response.data;
    },
    enabled: !!taskId,
  });
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { taskId } = useParams<{ taskId: string }>();

  const { data, isLoading, error, refetch } = useTaskStart(taskId);

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
