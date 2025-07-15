"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Challenge } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { useQuery } from "@tanstack/react-query";

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
  return useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: async (): Promise<Challenge> => {
      if (!challengeId) {
        throw new Error("Challenge ID is required");
      }
      const response = await api.challenge.get(challengeId);
      return response.data;
    },
    enabled: !!challengeId,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const [challengeId, setChallengeId] = useState<number | undefined>(undefined);

  const { data: challenge, isLoading, error } = useChallengeQuery(challengeId);

  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      logout();
    }
  }, [error, logout]);

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
