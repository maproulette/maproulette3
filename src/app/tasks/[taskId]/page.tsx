"use client";

import { useTask, useChallenge, useProject } from "@/app/context";
import { JsonDisplayWidget } from "@/app/components";

const ChallengeWidget = () => {
  const { challenge } = useChallenge();
  return <JsonDisplayWidget title="Challenge Information" data={challenge} />;
};

const ProjectWidget = () => {
  const { project } = useProject();
  return <JsonDisplayWidget title="Project Information" data={project} />;
};

const TaskWidget = () => {
  const { task } = useTask();
  return <JsonDisplayWidget title="Task Information" data={task} />;
};

const TaskPage = () => {
  const { task } = useTask();
  const { challenge } = useChallenge(task?.parent);
  const { project } = useProject(challenge?.parent);

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Task Page for ID: {task?.id} - {challenge?.name}
        </h1>
        <h5>Project: {project?.name}</h5>
        <h5>Challenge: {challenge?.name}</h5>
        <h5>Task: {task?.name}</h5>
        <ChallengeWidget />
        <ProjectWidget />
        <TaskWidget />
      </div>
    </div>
  );
};

export default TaskPage;
