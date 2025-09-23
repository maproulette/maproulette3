import { useState } from 'react';
import { Link, MapPane } from '../components';
import {
  ChallengeProvider,
  ProjectProvider,
  TaskProvider,
  useChallenge,
  useProject,
  useTask,
} from '../context';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  subtitle?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  isExpanded = false,
  subtitle,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        type="button"
        aria-expanded={expanded}
        aria-controls={`${title.toLowerCase().replace(/\s+/g, '-')}-content`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <span className="text-sm text-gray-500">({subtitle})</span>}
        </div>
        <div className="text-gray-400 hover:text-gray-600">
          {expanded ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </button>
      {expanded && (
        <div id={`${title.toLowerCase().replace(/\s+/g, '-')}-content`} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

const TaskPageInternal = () => {
  const { task } = useTask();
  const { challenge } = useChallenge(task?.parent);
  const { project } = useProject(challenge?.parent);

  return (
    <div className="h-[calc(100vh-5rem)] mt-20 overflow-hidden">
      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 h-full">
          {/* Left Column - Task Info */}
          <div className="space-y-6 lg:col-span-3 overflow-y-auto">
            {/* Header with lock icon and task ID */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-700">
                Task: {task?.id || '304911938'}
              </span>
            </div>

            {/* Main title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {task?.name || 'Convert Wastewater Treatment Plant Nodes to Areas'}
            </h1>

            {/* Link to mapping guidelines */}
            <div className="mb-8">
              <Link href="#" className="text-blue-600 hover:text-blue-800 underline">
                Correctly Map Features (US)
              </Link>
            </div>

            {/* Instructions Card - Expanded by default */}
            <CollapsibleCard title="Instructions" isExpanded={true}>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The purpose of this challenge is to convert man_made=wastewater_plant nodes to
                  areas:
                </p>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>
                      Utilize aerial imagery as a reference to accurately draw the outline of the
                      wastewater treatment plant.
                    </li>
                    <li>
                      After creating the area, merge the original man_made=wastewater_plant node
                      with the newly drawn area.
                    </li>
                    <li>
                      (Optional) Add accompanying wastewater basin areas (natural=water +
                      water=wastewater) as relevant.
                    </li>
                  </ol>
                </div>
              </div>
            </CollapsibleCard>

            {/* Task Information Card - Collapsed by default */}
            <CollapsibleCard title="Task Information" subtitle="3 tasks bundled" isExpanded={false}>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Task ID:</strong> {task?.id || '304911938'}
                </p>
                <p>
                  <strong>Challenge:</strong> {challenge?.name || 'Wastewater Treatment Plants'}
                </p>
                <p>
                  <strong>Project:</strong> {project?.name || 'US Infrastructure Mapping'}
                </p>
                <p>
                  <strong>Status:</strong> Available
                </p>
                <p>
                  <strong>Priority:</strong> Medium
                </p>
                <p>
                  <strong>Difficulty:</strong> {challenge?.difficulty || 2}/5
                </p>
              </div>
            </CollapsibleCard>

            {/* Metrics Card - Collapsed by default */}
            <CollapsibleCard title="Metrics" isExpanded={false}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-gray-500">Time Spent</p>
                  <p className="text-2xl font-bold text-gray-900">0m</p>
                </div>
                <div>
                  <p className="text-gray-500">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
                <div>
                  <p className="text-gray-500">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                </div>
              </div>
            </CollapsibleCard>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-7 h-full relative z-10">
            <MapPane className="w-full h-[calc(100vh-10rem)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaskPage = () => {
  return (
    <ProjectProvider>
      <ChallengeProvider>
        <TaskProvider>
          <TaskPageInternal />
        </TaskProvider>
      </ChallengeProvider>
    </ProjectProvider>
  );
};
