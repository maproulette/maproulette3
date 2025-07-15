"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Project } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { useQuery } from "@tanstack/react-query";

type ProjectContextType = {
  project: Project | null;
};

type ProjectContextTypeInternal = ProjectContextType & {
  setProjectId: (id: number | undefined) => void;
};

const ProjectContext = createContext<ProjectContextTypeInternal | undefined>(
  undefined
);

interface ProjectProviderProps {
  children: ReactNode;
}

export const useProjectQuery = (projectId?: number) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project> => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      const response = await api.project.get(projectId);
      return response.data;
    },
    enabled: !!projectId,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const [projectId, setProjectId] = useState<number | undefined>(undefined);

  const { data: project, isLoading, error } = useProjectQuery(projectId);

  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      logout();
    }
  }, [error, logout]);

  const value: ProjectContextTypeInternal = {
    project: project || null,
    setProjectId,
  };

  if (isLoading) {
    return <Loader message="Loading project..." />;
  }

  if (error) {
    return <ErrorComponent message="Error loading project" />;
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = (projectId?: number): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }

  useEffect(() => {
    if (projectId) {
      context.setProjectId(projectId);
    }
  }, [projectId]);

  return { project: context.project };
};

export { ProjectContext };
