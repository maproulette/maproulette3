import { ListTodo, MessageSquare, Target, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { EmptyState } from '../../shared/EmptyState'
import { LoadingState } from '../../shared/LoadingState'
import { SectionDivider } from '../../shared/SectionDivider'
import { TextInputFilter } from '../../shared/TextInputFilter'

// Filler data for comments
const FILLER_COMMENTS = [
  {
    id: 'c1',
    text: 'This stop sign appears to be correct based on recent street view imagery',
    author: 'MapperJohn',
    resourceType: 'task',
    resourceId: 1001,
    resourceName: 'Add missing stop signs in downtown',
    created: '2024-10-28',
  },
  {
    id: 'c2',
    text: 'Could someone verify the coordinates? They seem slightly off',
    author: 'SarahMaps',
    resourceType: 'task',
    resourceId: 1002,
    resourceName: 'Fix incorrect street name - Main St',
    created: '2024-10-27',
  },
  {
    id: 'c3',
    text: 'Great challenge! Very clear instructions and good coverage',
    author: 'CityMapper',
    resourceType: 'challenge',
    resourceId: 101,
    resourceName: 'Missing Stop Signs Challenge',
    created: '2024-10-25',
  },
  {
    id: 'c4',
    text: 'Fixed this one, building address was indeed incorrect',
    author: 'DataValidator',
    resourceType: 'task',
    resourceId: 1003,
    resourceName: 'Verify building addresses on Elm Street',
    created: '2024-10-24',
  },
  {
    id: 'c5',
    text: 'Would be helpful to have more context images for this challenge',
    author: 'NewMapper',
    resourceType: 'challenge',
    resourceId: 102,
    resourceName: 'Street Name Corrections',
    created: '2024-10-23',
  },
  {
    id: 'c6',
    text: 'The park amenities have been updated according to the latest survey',
    author: 'GreenMapper',
    resourceType: 'task',
    resourceId: 1004,
    resourceName: 'Update park amenities and facilities',
    created: '2024-10-22',
  },
]
interface FindCommentsProps {
  onResultSelect: () => void
  commentType?: 'all' | 'task' | 'challenge'
}

export const FindComments = ({ onResultSelect }: FindCommentsProps) => {
  const [searchText, setSearchText] = useState('')
  const [isLoading] = useState(false)

  // Filter comments based on criteria
  const filteredComments = FILLER_COMMENTS.filter((comment) => {
    if (searchText && !comment.text.toLowerCase().includes(searchText.toLowerCase())) return false
    return true
  })
  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
        <div className="space-y-3">
          <TextInputFilter
            label="Search Text"
            value={searchText}
            onChange={setSearchText}
            placeholder="Search comment content..."
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <SectionDivider label="Results" icon={MessageSquare} />

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Loading comments..." />
          ) : filteredComments.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No comments found"
              description="Try adjusting your search criteria"
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredComments.length} comment{filteredComments.length !== 1 ? 's' : ''}
                </span>
              </div>
              {filteredComments.map((comment) => (
                <button
                  key={comment.id}
                  type="button"
                  onClick={() => {
                    onResultSelect()
                  }}
                  className={cn(
                    'group w-full cursor-pointer space-y-2 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-left',
                    'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-lg',
                    'dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {comment.resourceType === 'task' ? (
                        <ListTodo className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {comment.resourceType}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(comment.created).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-900 leading-relaxed dark:text-zinc-100">
                    {comment.text}
                  </p>

                  <div className="flex items-center justify-between border-zinc-100 border-t pt-2 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <User className="h-3 w-3" />
                      <span>{comment.author}</span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      on: {comment.resourceName}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
