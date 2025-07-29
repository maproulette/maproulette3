import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Challenge } from "../types";
import { api, useApiQueryPublic, QUERY_KEYS } from "../utils";
import { Loader, Error as ErrorComponent } from "../components";

type PreferredChallengesContextType = {
  preferredChallenges: Challenge[];
};

const PreferredChallengesContext = createContext<
  PreferredChallengesContextType | undefined
>(undefined);

interface PreferredChallengesProviderProps {
  children: ReactNode;
}

export const usePreferredChallengesQuery = () => {
  return useApiQueryPublic({
    queryKey: QUERY_KEYS.challenges.preferred,
    queryFn: async (): Promise<Challenge[]> => {
      const response = await api.challenges.preferred();
      return response.data;
    },
  });
};

export const PreferredChallengesProvider: React.FC<
  PreferredChallengesProviderProps
> = ({ children }) => {
  const { data, isLoading, error } = usePreferredChallengesQuery();

  const value: PreferredChallengesContextType = {
    preferredChallenges: data || [],
  };

  if (isLoading) {
    return <Loader message="Loading preferred challenges..." />;
  }

  if (error) {
    return <ErrorComponent message="Error loading preferred challenges" />;
  }

  return (
    <PreferredChallengesContext.Provider value={value}>
      {children}
    </PreferredChallengesContext.Provider>
  );
};

export const usePreferredChallenges = (): PreferredChallengesContextType => {
  const context = useContext(PreferredChallengesContext);
  if (context === undefined) {
    throw new Error(
      "usePreferredChallenges must be used within a PreferredChallengesProvider"
    );
  }

  return context;
};

export { PreferredChallengesContext };
