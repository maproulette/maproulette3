import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, Layers, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { ChallengeMap } from '@/components/ChallengeMap'
import { challenge } from '@/api/challenge'
import { ChallengeCard } from './components/ChallengeCard'


export const Challenges = () => {
  const [showOnMap, setShowOnMap] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [showGlobal, setShowGlobal] = useState(false)
  const [sortBy, setSortBy] = useState('Default')
  const { data: challenges, isLoading } = useQuery(challenge.featuredChallenges(50))

  if (!challenges) {
    return <div>No challenges found</div>
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-120 mr-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          {/* Title and Filters Button */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold">Challenges</h1>
            <Button variant="outline" size="default" className="px-4 py-2">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Show on Map / Anywhere + Checkboxes */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Button
                variant={showOnMap ? 'default' : 'outline'}
                size="default"
                onClick={() => setShowOnMap(!showOnMap)}
                className="p-2 text-xs rounded-r-none"
              >
                Show on Map
              </Button>
              <Button variant="outline" size="default" className="p-2 text-xs rounded-l-none">
                Anywhere
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="archived"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300"
                />
                <label htmlFor="archived" className="text-xs font-medium">
                  Archived
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="global"
                  checked={showGlobal}
                  onChange={(e) => setShowGlobal(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300"
                />
                <label htmlFor="global" className="text-xs font-medium">
                  Global Challenges
                </label>
              </div>
            </div>
          </div>

          {/* Results Count and Sort */}
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {challenges.length} results
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Default">Default</SelectItem>
                <SelectItem value="Name">Name</SelectItem>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Challenge List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-zinc-500">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">No challenges found</div>
          ) : (
            <div className="p-4 space-y-3">
              {challenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <ChallengeMap challenges={challenges} className="h-full" zoom={1} />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <Layers className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </Button>
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <Globe className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
