import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { ChallengeCard } from './ChallengeCard'
import { useSearchContext } from '../../SearchContextProvider'
import Header from './Header'

const SideBar = () => {
  const { extendedFindParams } = useSearchContext()
    const { data: challenges, isLoading } = useQuery(api.challenge.extendedFind(extendedFindParams))

  return (
    <div className="w-120 mr-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      <Header />

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-zinc-500">Loading challenges...</div>
        ) : !challenges || challenges.length === 0 ? (
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
  )
}

export default SideBar
