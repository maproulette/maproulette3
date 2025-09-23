import { useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import {
  ChallengeProvider,
  ProjectProvider,
  TasksProvider,
  TaskClusterProvider,
  useChallenge,
  useTaskCluster,
} from '../context';
import { ProgressBar, StatisticsCards, StartButton, Tags, MapPane } from '../components';

export const ChallengePageInternal = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { challenge, activity, stats } = useChallenge(challengeId);
  const { taskClusters, updateBounds, updatePoints } = useTaskCluster(challengeId);

  // Handle bounds updates
  const handleBoundsChange = (bounds: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  }) => {
    // console.log('ChallengePage received bounds change:', bounds);
    updateBounds(bounds);
  };

  // Update points based on zoom level or other criteria
  useEffect(() => {
    updatePoints(25); // Default points, could be made dynamic based on zoom level
  }, [updatePoints]);

  // Debug task clusters
  useEffect(() => {
    if (taskClusters.length > 0) {
      console.log('Task clusters loaded:', taskClusters);
    }
  }, [taskClusters]);

  // Convert task clusters to tasks for display on map
  const clusterTasks = useMemo(
    () =>
      taskClusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
        status: 0, // Default status
        priority: 0, // Default priority
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        parent: 0,
        instruction: `Task cluster with ${cluster.taskCount} tasks`,
        geometries: {
          type: 'FeatureCollection',
          features: [],
        },
        review: {},
        changesetId: 0,
        errorTags: '',
      })),
    [taskClusters.length, taskClusters.map((c) => c.id).join(',')]
  );

  if (!challenge) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  // Process activity data to calculate statistics
  const processActivityData = (activityData: typeof activity) => {
    const statusCounts = activityData.reduce(
      (acc, item) => {
        acc[item.statusName] = (acc[item.statusName] || 0) + item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    // Map status names to display labels and colors
    const statusMapping: Record<string, { label: string; color: string }> = {
      Fixed: { label: 'Fixed', color: 'text-teal-600' },
      Already_Fixed: { label: 'Already Fixed', color: 'text-orange-400' },
      Not_An_Issue: { label: 'Not An Issue', color: 'text-orange-400' },
      Skipped: { label: 'Skipped', color: 'text-purple-600' },
      Too_Hard: { label: "Can't Complete", color: 'text-red-600' },
    };

    // Always include these required stats, even if they don't exist in the data
    const requiredStats = ['Fixed', 'Already_Fixed', 'Not_An_Issue', 'Skipped', 'Too_Hard'];

    return requiredStats.map((statusName) => {
      const count = statusCounts[statusName] || 0;
      const mapping = statusMapping[statusName] || { label: statusName, color: 'text-gray-600' };
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      return {
        label: mapping.label,
        percentage,
        count,
        total: totalTasks,
        color: mapping.color,
      };
    });
  };

  const activityData = processActivityData(activity);

  // Calculate real progress data from stats
  const calculateProgressData = () => {
    if (!stats || stats.length === 0) {
      return {
        completionPercentage: challenge.completionPercentage || 0,
        totalTasks: activityData.reduce((sum, stat) => sum + stat.count, 0),
        remainingTasks: challenge.tasksRemaining || 0,
        averageTime: 'No data',
      };
    }

    const challengeStats = stats[0]; // Get the first (and likely only) stats entry
    const actions = challengeStats.actions;

    // Calculate completion percentage: (completed tasks / total tasks) * 100
    const completedTasks =
      actions.fixed +
      actions.alreadyFixed +
      actions.falsePositive +
      actions.skipped +
      actions.deleted +
      actions.tooHard +
      actions.answered +
      actions.validated +
      actions.disabled;
    const totalTasks = actions.total;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Format average time from seconds to readable format
    const formatAverageTime = (seconds: number, tasksWithTime: number) => {
      // If no tasks have time data or avgTimeSpent is 0, show "No data"
      if (!tasksWithTime || tasksWithTime === 0 || !seconds || seconds === 0) {
        return 'No data';
      }

      if (seconds < 60) {
        return `${Math.round(seconds)}s`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
    };

    return {
      completionPercentage,
      totalTasks,
      remainingTasks: actions.available,
      averageTime: formatAverageTime(actions.avgTimeSpent, actions.tasksWithTime),
    };
  };

  const progressData = calculateProgressData();

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'Expert';
      default:
        return 'Unknown';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'text-green-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-orange-600';
      case 4:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] mt-20 overflow-hidden">
      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
          {/* Left Column - Challenge Info and Stats */}
          <div className="space-y-8 lg:col-span-2 overflow-y-auto">
            {/* Challenge Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)} bg-gray-100`}
                >
                  {getDifficultyText(challenge.difficulty)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(challenge.created).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{challenge.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Comments"
                  >
                    <title>Comments</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-sm">Comments</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Bookmark"
                  >
                    <title>Bookmark</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span className="text-sm">Bookmark</span>
                </button>
              </div>

              <div className="mb-4">
                <Tags tags={challenge.tags || ['Mapping Racism', 'impiaaa']} />
              </div>

              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {challenge.description ||
                    'Adding name:etymology:wikidata or subject:wikidata tags to OSM features named after civil rights leaders. Lorem Ipsum is simply dummy text of the printing and typesetting industry...'}
                </p>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Show more
                </button>
              </div>
            </div>

            {/* Progress Section */}
            <div>
              <ProgressBar
                percentage={progressData.completionPercentage}
                totalTasks={progressData.totalTasks}
                remainingTasks={progressData.remainingTasks}
                averageTime={progressData.averageTime}
              />
            </div>

            {/* Statistics Cards */}
            <div>
              <StatisticsCards stats={activityData} />
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3 h-full relative z-10">
            {/* Task Cluster Info */}
            {taskClusters.length > 0 && (
              <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg px-3 py-2 text-sm">
                <div className="font-semibold text-gray-900">
                  {taskClusters.length} Task Cluster{taskClusters.length !== 1 ? 's' : ''}
                </div>
                <div className="text-gray-600">
                  Total tasks: {taskClusters.reduce((sum, cluster) => sum + cluster.taskCount, 0)}
                </div>
              </div>
            )}

            <MapPane
              // challenge={challenge}
              className="w-full h-[calc(100vh-10rem)]"
              // showTaskMarkers={true}
              // tasks={clusterTasks}
              // onBoundsChange={handleBoundsChange}
              // For now, let's use the default style without vector tiles
              // You can add vector tiles later with proper API keys
              // onTaskClick={(task) => {
              //   console.log('Task cluster clicked:', task);
              //   // TODO: Navigate to task or show task details
              // }}
            />
          </div>
        </div>
      </div>

      {/* Floating Start Button */}
      <StartButton challengeId={Number(challengeId)} />
    </div>
  );
};

export const ChallengePage = () => {
  return (
    <ProjectProvider>
      <ChallengeProvider>
        <TaskClusterProvider>
          <TasksProvider>
            <ChallengePageInternal />
          </TasksProvider>
        </TaskClusterProvider>
      </ChallengeProvider>
    </ProjectProvider>
  );
};
