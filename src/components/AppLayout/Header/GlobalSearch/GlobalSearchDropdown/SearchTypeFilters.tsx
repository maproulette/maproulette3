import { SearchType } from '@/types/GlobalSearch'
import { FindById } from './FindById'
import { FindChallenge } from './FindChallenge'
import { FindComments } from './FindComments'
import { FindFeatureByName } from './FindFeatureByName'
import { FindProject } from './FindProject'
import { FindTask } from './FindTask'

export const SearchTypeFilters = ({ searchType }: { searchType: SearchType }) => {
  return (
    <div>
      {searchType === SearchType.FIND_A_CHALLENGE && <FindChallenge />}
      {searchType === SearchType.FIND_A_TASK && <FindTask />}
      {searchType === SearchType.FIND_A_PROJECT && <FindProject />}
      {searchType === SearchType.FIND_A_MAPROULETTE_ID && <FindById />}
      {searchType === SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME && <FindFeatureByName />}
      {searchType === SearchType.FIND_A_TASK_COMMENT && <FindComments commentType="task" />}
      {searchType === SearchType.FIND_A_CHALLENGE_COMMENT && (
        <FindComments commentType="challenge" />
      )}
    </div>
  )
}
