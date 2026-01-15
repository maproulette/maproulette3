import { SearchType } from '@/types/GlobalSearch'
import { FindChallenge } from './FindChallenge'

interface SearchTypeFiltersProps {
  searchType: SearchType
  searchQuery?: string
  onResultSelect: () => void
}

export const SearchTypeFilters = ({
  searchType,
  searchQuery = '',
  onResultSelect,
}: SearchTypeFiltersProps) => {
  return (
    <div>
      {searchType === SearchType.FIND_A_CHALLENGE && (
        <FindChallenge searchQuery={searchQuery} onResultSelect={onResultSelect} />
      )}
      {/* {searchType === SearchType.FIND_A_TASK && (
        <FindTask searchQuery={searchQuery} onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_PROJECT && (
        <FindProject searchQuery={searchQuery} onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_MAPROULETTE_ID && (
        <FindMapRouletteId searchQuery={searchQuery} onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME && (
        <FindFeatureByName searchQuery={searchQuery} onResultSelect={onResultSelect} />
      )}
      {searchType === SearchType.FIND_A_TASK_COMMENT && (
        <FindComments
          searchQuery={searchQuery}
          onResultSelect={onResultSelect}
          commentType="task"
        />
      )}
      {searchType === SearchType.FIND_A_CHALLENGE_COMMENT && (
        <FindComments
          searchQuery={searchQuery}
          onResultSelect={onResultSelect}
          commentType="challenge"
        />
      )} */}
    </div>
  )
}
