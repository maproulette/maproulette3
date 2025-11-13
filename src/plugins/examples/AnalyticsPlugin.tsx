import { BarChart3, TrendingUp, Activity } from 'lucide-react'
import type { Plugin, PluginNavigationItem, PluginPage } from '@/types/Plugin'

/**
 * Analytics page component
 */
const AnalyticsPageComponent = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <BarChart3 className="size-6 text-blue-600" />
        </div>
        <div>
          <h1 className="font-bold text-3xl">Analytics Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track your MapRoulette progress and statistics
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Tasks Completed</p>
              <p className="mt-1 font-bold text-3xl">1,234</p>
            </div>
            <Activity className="size-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">This Week</p>
              <p className="mt-1 font-bold text-3xl">87</p>
            </div>
            <TrendingUp className="size-8 text-green-600" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Accuracy</p>
              <p className="mt-1 font-bold text-3xl">94%</p>
            </div>
            <BarChart3 className="size-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 font-semibold text-xl">Analytics Plugin Demo</h2>
        <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <p>
            This is a demonstration analytics dashboard loaded from a plugin. In a real
            implementation, this could display:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Real-time task completion statistics</li>
            <li>Performance trends over time</li>
            <li>Leaderboard rankings</li>
            <li>Challenge-specific analytics</li>
            <li>Custom visualizations and charts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Analytics Plugin - Provides analytics and statistics navigation
 */
export const AnalyticsPlugin: Plugin = {
  metadata: {
    id: 'analytics-plugin',
    name: 'Analytics Dashboard',
    description: 'Adds advanced analytics and statistics features to track your MapRoulette progress',
    version: '1.0.0',
    author: 'MapRoulette Team',
  },

  initialize: async () => {
    console.log('Analytics Plugin initialized!')
    // In a real plugin, you might:
    // - Initialize analytics tracking
    // - Load user analytics preferences
    // - Set up event listeners
  },

  cleanup: async () => {
    console.log('Analytics Plugin cleaned up!')
    // Clean up any resources, event listeners, etc.
  },

  getNavigationItems: (): PluginNavigationItem[] => {
    return [
      {
        id: 'analytics-nav-item',
        label: 'Analytics',
        to: '/plugin/analytics-plugin/dashboard',
        icon: <BarChart3 className="size-4" />,
        order: 50,
      },
    ]
  },

  getPages: (): PluginPage[] => {
    return [
      {
        id: 'dashboard',
        title: 'Analytics Dashboard',
        description: 'View your MapRoulette analytics and statistics',
        component: AnalyticsPageComponent,
      },
    ]
  },

  onUserSettingsChange: (settings) => {
    console.log('Analytics Plugin: User settings changed', settings)
    // Handle user settings changes if needed
  },
}

