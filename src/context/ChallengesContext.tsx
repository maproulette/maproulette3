import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { ErrorComponent } from '../components';
import type { Challenge, ExtendedFindParams } from '../types';
import { FEATURED_CHALLENGES_KEY, EXTENDED_FIND_CHALLENGES_KEY } from '../types/Challenge';
import { api, useApiQuery } from '../utils';

type ChallengesContextType = {
  featuredChallenges: Challenge[];
  extendedFindChallenges: Challenge[];
};

type ChallengesContextTypeInternal = ChallengesContextType & {
  setFeaturedLimit: (limit: number) => void;
  setExtendedFindParams: (params: ExtendedFindParams) => void;
};

const ChallengesContext = createContext<ChallengesContextTypeInternal | undefined>(undefined);

interface ChallengesProviderProps {
  children: ReactNode;
}

export const useFeaturedChallengesQuery = (limit: number = 50) => {
  return useApiQuery({
    queryKey: [...FEATURED_CHALLENGES_KEY, limit],
    queryFn: async (): Promise<Challenge[]> => {
      const response = await api.challenges.featured(limit);
      return response.data;
    },
    enabled: true,
  });
};

export const useExtendedFindChallengesQuery = (params: ExtendedFindParams) => {
  return useApiQuery({
    queryKey: EXTENDED_FIND_CHALLENGES_KEY(params),
    queryFn: async (): Promise<Challenge[]> => {
      // Build URL search parameters from the params object
      const searchParams = new URLSearchParams();

      // Convert params to URL search parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const response = await api.challenges.extendedFind(queryString);
      return response.data;
    },
    enabled: true,
  });
};

export const ChallengesProvider: React.FC<ChallengesProviderProps> = ({ children }) => {
  const [featuredLimit, setFeaturedLimit] = useState<number>(50);
  const [extendedFindParams, setExtendedFindParams] = useState<ExtendedFindParams>({});

  const { data: featuredChallenges, error } = useFeaturedChallengesQuery(featuredLimit);
  const { data: extendedFindChallenges, error: extendedFindError } =
    useExtendedFindChallengesQuery(extendedFindParams);

  const value: ChallengesContextTypeInternal = {
    featuredChallenges: featuredChallenges || [],
    setFeaturedLimit,
    extendedFindChallenges: extendedFindChallenges || [],
    setExtendedFindParams,
  };

  if (error || extendedFindError) {
    return <ErrorComponent message="Error loading challenges" />;
  }

  return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
};

export const useChallenges = (): ChallengesContextType => {
  const context = useContext(ChallengesContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }

  return {
    featuredChallenges: context.featuredChallenges,
    extendedFindChallenges: context.extendedFindChallenges,
  };
};

export { ChallengesContext };
