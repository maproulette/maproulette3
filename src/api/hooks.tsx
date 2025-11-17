import { useQuery } from '@tanstack/react-query'
import { api } from './index'

/**
 * API Hooks for Plugins
 * These hooks can be imported by plugins to access MapRoulette API
 */

// Task hooks
export const useTask = (taskId: number) => {
  const query = useQuery(api.task.getTask(taskId))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export const useStartTask = (taskId: number) => {
  const query = useQuery(api.task.startTask(taskId))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export const useTaskMarkers = (params: any) => {
  const query = useQuery(api.task.getTaskMarkers(params))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

// Challenge hooks
export const useChallenge = (challengeId: number) => {
  const query = useQuery(api.challenge.getChallenge(challengeId))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export const useChallengeTaskMarkers = (challengeId: number) => {
  const query = useQuery(api.challenge.getChallengeTaskMarkers(challengeId))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

// User hooks
export const useCurrentUser = () => {
  const query = useQuery(api.user.whoAmI(false))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

// Project hooks
export const useProject = (projectId: number) => {
  const query = useQuery(api.project.getProject(projectId))
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
