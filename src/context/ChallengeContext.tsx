import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ErrorComponent, Loader } from '../components';
import type { Challenge } from '../types';
import { CHALLENGE_BY_ID_KEY } from '../types/Challenge';
import { api, useApiQuery } from '../utils';

type ChallengeContextType = {
  challenge: Challenge | null;
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

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({ children }) => {
  const [challengeId, setChallengeId] = useState<number | undefined>(undefined);

  const { data: challenge, isLoading, error } = useChallengeQuery(challengeId);

  const value: ChallengeContextTypeInternal = {
    challenge: challenge || null,
    setChallengeId,
  };

  if (isLoading) {
    return <Loader message="Loading challenge..." />;
  }

  if (error) {
    return <ErrorComponent message="Error loading challenge" />;
  }

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = (challengeId?: number): ChallengeContextType => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }

  useEffect(() => {
    if (challengeId) {
      context.setChallengeId(challengeId);
    }
  }, [challengeId, context.setChallengeId]);

  return { challenge: context.challenge };
};

export { ChallengeContext };
