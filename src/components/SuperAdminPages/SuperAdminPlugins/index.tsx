import { Code, Download, Plus, Puzzle, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { BackLink } from '@/components/shared/BackLink'
import { SearchBar } from '@/components/shared/SearchBar'
import { SuperAdminGuard } from '@/components/shared/SuperAdminGuard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    case 'beta':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'deprecated':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

const PluginCard = ({ plugin }: { plugin: (typeof mockPlugins)[0] }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-orange-100 dark:bg-orange-900">
              <Puzzle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{plugin.name}</CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                v{plugin.version} • by {plugin.author}
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
            <span>{plugin.downloads.toLocaleString()} downloads</span>
          </div>
          <div>Updated: {plugin.lastUpdated}</div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Code className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const SuperAdminPlugins = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlugins = mockPlugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SuperAdminGuard>
      <div className="mx-auto px-4">
        <BackLink to="/super-admin">Back to Super Admin</BackLink>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Puzzle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                  Plugin Management
                </h1>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage plugins and integrations for the platform
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="lg" variant="outline">
                <Upload className="mr-2 h-5 w-5" />
                Upload Plugin
              </Button>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Install Plugin
              </Button>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search plugins..."
          />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Plugins</CardDescription>
              <CardTitle className="text-3xl">24</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">+2 new this month</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Plugins</CardDescription>
              <CardTitle className="text-3xl">18</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">75% enabled</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Downloads</CardDescription>
              <CardTitle className="text-3xl">12.5K</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Across all plugins</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Updates</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Updates available</div>
            </CardContent>
          </Card>
        </div>

        {/* Plugins Grid */}
        <div
          className={cn(
            'grid gap-6',
            filteredPlugins && filteredPlugins.length > 0
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {filteredPlugins.length > 0 ? (
            filteredPlugins.map((plugin) => <PluginCard key={plugin.id} plugin={plugin} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Search className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                No plugins found
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </SuperAdminGuard>
  )
}
