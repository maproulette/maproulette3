import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Challenge } from "../types";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { useQuery } from "@tanstack/react-query";

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
  return useQuery({
    queryKey: ["preferred-challenges"],
    queryFn: async (): Promise<Challenge[]> => {
      const response = await api.challenges.preferred();
      return response.data;
    },
    retry: (failureCount, error: unknown) => {
      const apiError = error as { status?: number };
      if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
        return false;
      }
      return failureCount < 3;
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
