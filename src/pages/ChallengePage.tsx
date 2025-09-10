import { useParams } from 'react-router-dom';
import { ChallengeProvider, ProjectProvider, useChallenge } from '../context';

export const ChallengePageInternal = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { challenge } = useChallenge(challengeId);

  console.log(challenge);

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 mt-2">Challenge Page {challengeId}</h1>
        <h5>Challenge: {challenge?.name}</h5>
        <h5>Challenge: {challenge?.name}</h5>
      </div>
    </div>
  );
};

export const ChallengePage = () => {
  return (
    <ProjectProvider>
      <ChallengeProvider>
        <ChallengePageInternal />
      </ChallengeProvider>
    </ProjectProvider>
  );
};
