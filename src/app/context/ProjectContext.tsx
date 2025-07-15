"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Project } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { executeApiRequest } from "../utils/apiErrorHandler";

type ProjectContextType = {
  project: Project | null;
  getProject: (projectId: number) => Promise<Project | null>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  projectId?: number;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
  projectId,
}) => {
  const { logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<number | undefined>(
    projectId
  );

  const getProject = useCallback(
    async (projectId: number): Promise<Project | null> => {
      setError(null);
      setCurrentProjectId(projectId);
      return await executeApiRequest(() => api.project.get(projectId), {
        on401: logout,
        setData: (data) => setProject(data as Project | null),
        setIsLoading,
        onError: (error: Error | unknown) => {
          console.error("Failed to fetch project data:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch project data"
          );
        },
      });
    },
    [logout]
  );

  const retry = useCallback(() => {
    if (currentProjectId) {
      getProject(currentProjectId);
    }
  }, [currentProjectId, getProject]);

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId, getProject]);

  const value: ProjectContextType = {
    project,
    getProject,
  };

  // Show loading state
  if (isLoading) {
    return <Loader message="Loading project..." />;
  }

  // Show error state
  if (error) {
    return <ErrorComponent message={error} onRetry={retry} />;
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

  const { getProject } = context;

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId, getProject]);

  return context;
};

export { ProjectContext };
