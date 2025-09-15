import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ErrorComponent, Loader } from '../components';
import type { Challenge, ChallengeActivity, ChallengeStats } from '../types';
import {
  CHALLENGE_BY_ID_KEY,
  CHALLENGE_ACTIVITY_KEY,
  CHALLENGE_STATS_KEY,
} from '../types/Challenge';
import { api, useApiQuery } from '../utils';

type ChallengeContextType = {
  challenge: Challenge | null;
  activity: ChallengeActivity[];
  stats: ChallengeStats[];
};

type ChallengeContextTypeInternal = ChallengeContextType & {
  setChallengeId: (id: number | undefined) => void;
};

const ChallengeContext = createContext<ChallengeContextTypeInternal | undefined>(undefined);

interface ChallengeProviderProps {
  children: ReactNode;
}

export const useChallengeQuery = (challengeId?: number) => {
  return useApiQuery({
    queryKey: challengeId ? CHALLENGE_BY_ID_KEY(challengeId) : ['challenge', 'undefined'],
    queryFn: async (): Promise<Challenge> => {
      if (!challengeId) {
        throw new Error('Challenge ID is required');
      }
      const response = await api.challenge.get(challengeId);
      return response.data;
    },
    enabled: !!challengeId,
  });
};

export const useChallengeActivityQuery = (challengeId?: number) => {
  return useApiQuery({
    queryKey: challengeId
      ? CHALLENGE_ACTIVITY_KEY(challengeId)
      : ['challenge', 'undefined', 'activity'],
    queryFn: async (): Promise<ChallengeActivity[]> => {
      if (!challengeId) {
        throw new Error('Challenge ID is required');
      }
      const response = await api.challenge.activity(challengeId);
      return response.data;
    },
    enabled: !!challengeId,
  });
};

export const useChallengeStatsQuery = (challengeId?: number) => {
  return useApiQuery({
    queryKey: challengeId ? CHALLENGE_STATS_KEY(challengeId) : ['challenge', 'undefined', 'stats'],
    queryFn: async (): Promise<ChallengeStats[]> => {
      if (!challengeId) {
        throw new Error('Challenge ID is required');
      }
      const response = await api.challenge.stats(challengeId);
      return response.data;
    },
    enabled: !!challengeId,
  });
};

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({ children }) => {
  const [challengeId, setChallengeId] = useState<number | undefined>(undefined);

  const { data: challenge, isLoading, error } = useChallengeQuery(challengeId);
  const {
    data: activity,
    isLoading: activityLoading,
    error: activityError,
  } = useChallengeActivityQuery(challengeId);
  const { data: stats } = useChallengeStatsQuery(challengeId);

  const value: ChallengeContextTypeInternal = {
    challenge: challenge || null,
    activity: activity || [],
    setChallengeId,
    stats: stats || [],
  };

  if (isLoading || activityLoading) {
    return <Loader message="Loading challenge..." />;
  }

  if (error || activityError) {
    return <ErrorComponent message="Error loading challenge" />;
  }

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = (challengeId?: number | string): ChallengeContextType => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }

  useEffect(() => {
    if (challengeId) {
      context.setChallengeId(Number(challengeId));
    }
  }, [challengeId, context.setChallengeId]);

  return { challenge: context.challenge, activity: context.activity, stats: context.stats };
};

export { ChallengeContext };
