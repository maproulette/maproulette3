import { Code, Download, Plus, Puzzle, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { SearchBar } from '@/components/shared/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/Empty'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

// Mock data - replace with actual API calls
const mockPlugins = [
  {
    id: 1,
    name: 'Analytics Plugin',
    version: '1.2.3',
    description: 'Advanced analytics and reporting for MapRoulette tasks',
    author: 'MapRoulette Team',
    status: 'active',
    downloads: 1234,
    lastUpdated: '2024-11-15',
  },
  {
    id: 2,
    name: 'Rapid Editor Integration',
    version: '2.0.1',
    description: 'Seamlessly integrate Rapid editor for advanced editing capabilities',
    author: 'MapRoulette Team',
    status: 'active',
    downloads: 892,
    lastUpdated: '2024-11-20',
  },
  {
    id: 3,
    name: 'Export Manager',
    version: '1.0.5',
    description: 'Export task data and results in various formats',
    author: 'Community',
    status: 'inactive',
    downloads: 456,
    lastUpdated: '2024-10-10',
  },
  {
    id: 4,
    name: 'Custom Validators',
    version: '0.9.0',
    description: 'Create custom validation rules for task completion',
    author: 'Community',
    status: 'beta',
    downloads: 234,
    lastUpdated: '2024-11-25',
  },
]

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactive':
      return 'bg-zinc-100 text-zinc-800 dark:bg-slate-800 dark:text-zinc-200'
    case 'beta':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'deprecated':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-slate-800 dark:text-zinc-200'
  }
}

const PluginCard = ({ plugin }: { plugin: (typeof mockPlugins)[0] }) => {
  const { t } = useIntl()
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-orange-100 dark:bg-orange-900">
              <Puzzle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{plugin.name}</CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t(
                  'superAdminPlugins.card.versionBy',
                  { version: plugin.version, author: plugin.author },
                  'v{version} • by {author}'
                )}
              </p>
            </div>
          </div>
          <Badge className={cn('capitalize', getStatusBadgeColor(plugin.status))}>
            {plugin.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 line-clamp-2">{plugin.description}</CardDescription>

        <div className="mb-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>
              {t(
                'superAdminPlugins.card.downloads',
                { count: plugin.downloads.toLocaleString() },
                '{count} downloads'
              )}
            </span>
          </div>
          <div>
            {t('superAdminPlugins.card.updated', { date: plugin.lastUpdated }, 'Updated: {date}')}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Code className="mr-2 h-4 w-4" />
            {t('superAdminPlugins.card.viewDetails', undefined, 'View Details')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            {t('superAdminPlugins.card.configure', undefined, 'Configure')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const SuperAdminPlugins = () => {
  const { t } = useIntl()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlugins = mockPlugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Puzzle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                {t('superAdminPlugins.title', undefined, 'Plugin Management')}
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {t(
                'superAdminPlugins.subtitle',
                undefined,
                'Manage plugins and integrations for the platform'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" variant="outline">
              <Upload className="mr-2 h-5 w-5" />
              {t('superAdminPlugins.uploadButton', undefined, 'Upload Plugin')}
            </Button>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              {t('superAdminPlugins.installButton', undefined, 'Install Plugin')}
            </Button>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('superAdminPlugins.searchPlaceholder', undefined, 'Search plugins...')}
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>
              {t('superAdminPlugins.stats.total', undefined, 'Total Plugins')}
            </CardDescription>
            <CardTitle className="font-semibold text-base">24</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t('superAdminPlugins.stats.totalChange', undefined, '+2 new this month')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>
              {t('superAdminPlugins.stats.active', undefined, 'Active Plugins')}
            </CardDescription>
            <CardTitle className="font-semibold text-base">18</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t('superAdminPlugins.stats.activeShare', undefined, '75% enabled')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>
              {t('superAdminPlugins.stats.totalDownloads', undefined, 'Total Downloads')}
            </CardDescription>
            <CardTitle className="font-semibold text-base">12.5K</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t('superAdminPlugins.stats.totalDownloadsNote', undefined, 'Across all plugins')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>
              {t('superAdminPlugins.stats.pendingUpdates', undefined, 'Pending Updates')}
            </CardDescription>
            <CardTitle className="font-semibold text-base">3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t('superAdminPlugins.stats.pendingUpdatesNote', undefined, 'Updates available')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plugins Grid */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
      >
        {filteredPlugins.length > 0 ? (
          filteredPlugins.map((plugin) => <PluginCard key={plugin.id} plugin={plugin} />)
        ) : (
          <Empty className="col-span-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>
                {t('superAdminPlugins.empty.title', undefined, 'No plugins found')}
              </EmptyTitle>
              <EmptyDescription>
                {t(
                  'common.tryAdjustingYourSearchQuery',
                  undefined,
                  'Try adjusting your search query.'
                )}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
