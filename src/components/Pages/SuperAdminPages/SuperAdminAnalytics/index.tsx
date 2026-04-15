import { Activity, BarChart3, FolderKanban, ListChecks, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard, StatCardGrid } from '@/components/ui/StatCard'

export const SuperAdminAnalytics = () => {
  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-bold text-2xl text-zinc-900 tracking-tight dark:text-zinc-50">
            Platform Analytics
          </h1>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View comprehensive analytics and metrics across the platform.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6">
        <h2 className="mb-4 font-semibold text-base text-zinc-900 dark:text-zinc-50">
          Key Metrics
        </h2>
        <StatCardGrid>
          <StatCard
            label="Total Users"
            value="12,456"
            icon={<Users className="size-4" />}
            description={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="size-3" />
                +12.3% from last month
              </span>
            }
          />
          <StatCard
            label="Active Projects"
            value="256"
            icon={<FolderKanban className="size-4" />}
            description={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="size-3" />
                +8.1% from last month
              </span>
            }
          />
          <StatCard
            label="Active Challenges"
            value="1,892"
            icon={<ListChecks className="size-4" />}
            description={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="size-3" />
                +15.2% from last month
              </span>
            }
          />
          <StatCard
            label="Tasks Completed"
            value="89.2K"
            icon={<Activity className="size-4" />}
            description={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="size-3" />
                +22.5% from last month
              </span>
            }
          />
        </StatCardGrid>
      </div>

      {/* User Activity */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active users over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-lg bg-zinc-100 dark:bg-slate-800">
              <p className="text-zinc-600 dark:text-zinc-400">Chart visualization placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
            <CardDescription>Tasks completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-lg bg-zinc-100 dark:bg-slate-800">
              <p className="text-zinc-600 dark:text-zinc-400">Chart visualization placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h2 className="mb-4 font-semibold text-base text-zinc-900 dark:text-zinc-50">
          Performance Metrics
        </h2>
        <StatCardGrid className="sm:grid-cols-3 lg:grid-cols-3">
          <StatCard
            label="Avg. Task Completion Time"
            value="8.5 min"
            description="Improved by 1.2 min this month"
          />
          <StatCard label="Daily Active Users" value="3,456" description="28% of total user base" />
          <StatCard label="System Uptime" value="99.8%" description="Last 30 days" />
        </StatCardGrid>
      </div>

      {/* Top Contributors */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Most active users this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="font-semibold text-blue-600 text-sm dark:text-blue-400">
                        {i}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                        User {i}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        user{i}@example.com
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                    {Math.floor(Math.random() * 500 + 100)} tasks
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Projects</CardTitle>
            <CardDescription>Projects with most activity this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Highway Mapping',
                'Building Footprints',
                'Parks and Recreation',
                'Street Names',
                'POI Validation',
              ].map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100 dark:bg-green-900">
                      <FolderKanban className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">{name}</p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                    {Math.floor(Math.random() * 1000 + 500)} tasks
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
