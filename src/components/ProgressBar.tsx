interface ProgressBarProps {
  percentage: number;
  totalTasks: number;
  remainingTasks: number;
  averageTime: string;
}

export const ProgressBar = ({
  percentage,
  totalTasks,
  remainingTasks,
  averageTime,
}: ProgressBarProps) => {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-6 bg-white rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-green-400 via-yellow-400 via-orange-400 to-red-500 transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Percentage markers */}
      <div className="flex justify-between text-xs text-gray-600 mb-4">
        {Array.from({ length: 11 }, (_, i) => i * 10).map((value) => (
          <span key={value}>{value}%</span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-700">
          <span className="font-medium">Tasks Remaining: </span>
          <span className="font-bold">{remainingTasks.toLocaleString()}</span>
          <span className="text-gray-500">
            ({Math.round((remainingTasks / totalTasks) * 100)}%) of {totalTasks.toLocaleString()}
          </span>
        </div>
        <div className="text-gray-700">
          <span className="font-medium">Avg time per task: </span>
          <span className="font-bold">{averageTime}</span>
        </div>
      </div>
    </div>
  );
};
