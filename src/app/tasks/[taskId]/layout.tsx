import {
  ProjectProvider,
  ChallengeProvider,
  TaskProvider,
} from "@/app/context";

export default function TaskPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProjectProvider>
      <ChallengeProvider>
        <TaskProvider>{children}</TaskProvider>
      </ChallengeProvider>
    </ProjectProvider>
  );
}
