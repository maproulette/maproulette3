interface StatCard {
  label: string;
  percentage: number;
  count: number;
  total: number;
  color: string;
}

interface StatisticsCardsProps {
  stats: StatCard[];
}

export const StatisticsCards = ({ stats }: StatisticsCardsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.percentage}%</div>
            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className="text-xs text-gray-500">
              {stat.label} ({stat.count}/{stat.total})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
