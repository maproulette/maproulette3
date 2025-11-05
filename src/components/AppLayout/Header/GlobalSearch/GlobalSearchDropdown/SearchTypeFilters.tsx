import { SearchType } from '@/types/GlobalSearch'
import { ExploreChallengesFilters } from './FindChallenge/FindChallengeResultSection'
import { FindComments } from './FindComments'
import { FindFeatureByName } from './FindFeatureByName'
import { FindMapRouletteId } from './FindMapRouletteId'
import { FindProject } from './FindProject'
import { FindTask } from './FindTask'

interface SearchTypeFiltersProps {
  searchType: SearchType
  onResultSelect: () => void
}

export const SearchTypeFilters = ({ searchType, onResultSelect }: SearchTypeFiltersProps) => {
  return (
    <div>
      {searchType === SearchType.FIND_A_CHALLENGE && (
        <ExploreChallengesFilters onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_TASK && <FindTask onResultSelect={onResultSelect} />}
      {searchType === SearchType.FIND_A_PROJECT && <FindProject onResultSelect={onResultSelect} />}
      {searchType === SearchType.FIND_A_MAPROULETTE_ID && (
        <FindMapRouletteId onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME && (
        <FindFeatureByName onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_TASK_COMMENT && (
        <FindComments onResultSelect={onResultSelect} commentType="task" />
      )}
      {searchType === SearchType.FIND_A_CHALLENGE_COMMENT && (
        <FindComments onResultSelect={onResultSelect} commentType="challenge" />
      )}
    </div>
  )
}
