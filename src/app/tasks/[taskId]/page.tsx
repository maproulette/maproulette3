"use client";

import { TaskProvider, useTask } from "@/app/context";

const TaskInternal = () => {
  const { task } = useTask();

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Task Page for ID: {task?.id}
        </h1>
      </div>
    </div>
  );
};

const Task = () => {
  return (
    <TaskProvider>
      <TaskInternal />
    </TaskProvider>
  );
};

export default Task;
