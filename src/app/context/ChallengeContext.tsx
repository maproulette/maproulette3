"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Challenge } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { Loader, Error as ErrorComponent } from "../components";
import { executeApiRequest } from "../utils/apiErrorHandler";

type ChallengeContextType = {
  challenge: Challenge | null;
  getChallenge: (challengeId: number) => Promise<Challenge | null>;
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(
  undefined
);

interface ChallengeProviderProps {
  children: ReactNode;
  challengeId?: number;
}

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({
  children,
  challengeId,
}) => {
  const { logout } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChallengeId, setCurrentChallengeId] = useState<
    number | undefined
  >(challengeId);

  const getChallenge = useCallback(
    async (challengeId: number): Promise<Challenge | null> => {
      setError(null);
      setCurrentChallengeId(challengeId);
      return await executeApiRequest(() => api.challenge.get(challengeId), {
        on401: logout,
        setData: (data) => setChallenge(data as Challenge | null),
        setIsLoading,
        onError: (error: Error | unknown) => {
          console.error("Failed to fetch challenge data:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch challenge data"
          );
        },
      });
    },
    [logout]
  );

  const retry = useCallback(() => {
    if (currentChallengeId) {
      getChallenge(currentChallengeId);
    }
  }, [currentChallengeId, getChallenge]);

  useEffect(() => {
    if (challengeId) {
      getChallenge(challengeId);
    }
  }, [challengeId, getChallenge]);

  const value: ChallengeContextType = {
    challenge,
    getChallenge,
  };

  // Show loading state
  if (isLoading) {
    return <Loader message="Loading challenge..." />;
  }

  // Show error state
  if (error) {
    return <ErrorComponent message={error} onRetry={retry} />;
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

  const { getChallenge } = context;

  useEffect(() => {
    if (challengeId) {
      getChallenge(challengeId);
    }
  }, [challengeId, getChallenge]);

  return context;
};

export { ChallengeContext };
