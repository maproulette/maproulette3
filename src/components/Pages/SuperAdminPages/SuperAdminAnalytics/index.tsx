import { Activity, BarChart3, FolderKanban, ListChecks, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const SuperAdminAnalytics = () => {
  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
            Platform Analytics
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          View comprehensive analytics and metrics across the platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6">
        <h2 className="mb-4 font-semibold text-base text-zinc-900 dark:text-zinc-50">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Users</CardDescription>
                <Users className="h-4 w-4 text-zinc-400" />
              </div>
              <CardTitle className="font-semibold text-base">12,456</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600 text-xs dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.3% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Projects</CardDescription>
                <FolderKanban className="h-4 w-4 text-zinc-400" />
              </div>
              <CardTitle className="font-semibold text-base">256</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600 text-xs dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Challenges</CardDescription>
                <ListChecks className="h-4 w-4 text-zinc-400" />
              </div>
              <CardTitle className="font-semibold text-base">1,892</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600 text-xs dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +15.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Tasks Completed</CardDescription>
                <Activity className="h-4 w-4 text-zinc-400" />
              </div>
              <CardTitle className="font-semibold text-base">89.2K</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600 text-xs dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +22.5% from last month
              </div>
            </CardContent>
          </Card>
        </div>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Task Completion Time</CardDescription>
              <CardTitle className="font-semibold text-base">8.5 min</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Improved by 1.2 min this month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Daily Active Users</CardDescription>
              <CardTitle className="font-semibold text-base">3,456</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">28% of total user base</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>System Uptime</CardDescription>
              <CardTitle className="font-semibold text-base">99.8%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Last 30 days</div>
            </CardContent>
          </Card>
        </div>
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
