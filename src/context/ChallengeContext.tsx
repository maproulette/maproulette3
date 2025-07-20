"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Challenge } from "../types";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { useApiQuery } from "../utils/useApiQuery";
import { QUERY_KEYS } from "../utils/queryKeys";

type ChallengeContextType = {
  challenge: Challenge | null;
};

type ChallengeContextTypeInternal = ChallengeContextType & {
  setChallengeId: (id: number | undefined) => void;
};

const ChallengeContext = createContext<
  ChallengeContextTypeInternal | undefined
>(undefined);

interface ChallengeProviderProps {
  children: ReactNode;
}

export const useChallengeQuery = (challengeId?: number) => {
  return useApiQuery({
    queryKey: QUERY_KEYS.challenges.byId(challengeId!),
    queryFn: async (): Promise<Challenge> => {
      const response = await api.challenge.get(challengeId!);
      return response.data;
    },
    enabled: !!challengeId,
  });
};

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({
  children,
}) => {
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

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = (challengeId?: number): ChallengeContextType => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error("useChallenge must be used within a ChallengeProvider");
  }

  useEffect(() => {
    if (challengeId) {
      context.setChallengeId(challengeId);
    }
  }, [challengeId]);

  return { challenge: context.challenge };
};

export { ChallengeContext };
