import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ErrorComponent, Loader } from '../components';
import type { Project } from '../types';
import { api, QUERY_KEYS, useApiQuery } from '../utils';

type ProjectContextType = {
  project: Project | null;
};

type ProjectContextTypeInternal = ProjectContextType & {
  setProjectId: (id: number | undefined) => void;
};

const ProjectContext = createContext<ProjectContextTypeInternal | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const useProjectQuery = (projectId?: number) => {
  return useApiQuery({
    queryKey: QUERY_KEYS.projects.byId(projectId),
    queryFn: async (): Promise<Project> => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await api.project.get(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projectId, setProjectId] = useState<number | undefined>(undefined);

  const { data: project, isLoading, error } = useProjectQuery(projectId);

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

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (projectId?: number): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }

  useEffect(() => {
    if (projectId) {
      context.setProjectId(projectId);
    }
  }, [projectId, context.setProjectId]);

  return { project: context.project };
};

export { ProjectContext };
