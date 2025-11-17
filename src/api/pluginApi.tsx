import { useQuery } from '@tanstack/react-query'
import { api } from '.'

/**
 * Plugin-friendly API that exposes hooks directly instead of query options
 * This allows plugins to use the API without importing @tanstack/react-query
 */
export const pluginApi = {
  task: {
    /**
     * Hook to get a task by ID
     */
    useTask: (taskId: number) => {
      return useQuery(api.task.getTask(taskId))
    },
    
    /**
     * Hook to start a task
     */
    useStartTask: (taskId: number) => {
      return useQuery(api.task.startTask(taskId))
    },
    
    /**
     * Hook to get task markers
     */
    useTaskMarkers: (params: any) => {
      return useQuery(api.task.getTaskMarkers(params))
    },
  },
  
  challenge: {
    /**
     * Hook to get a challenge by ID
     */
    useChallenge: (challengeId: number) => {
      return useQuery(api.challenge.getChallenge(challengeId))
    },
    
    /**
     * Hook to get challenge task markers
     */
    useChallengeTaskMarkers: (challengeId: number) => {
      return useQuery(api.challenge.getChallengeTaskMarkers(challengeId))
    },
  },
  
  user: {
    /**
     * Hook to get current user
     */
    useCurrentUser: () => {
      return useQuery(api.user.getCurrentUser())
    },
  },
  
  project: {
    /**
     * Hook to get a project by ID
     */
    useProject: (projectId: number) => {
      return useQuery(api.project.getProject(projectId))
    },
  },
}

