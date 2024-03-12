import { TaskReviewStatus, isNeedsReviewStatus, isMetaReviewStatus, TaskMetaReviewStatusWithUnset }
  from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { TaskStatus, isReviewableStatus }
  from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority } from '../../../services/Task/TaskPriority/TaskPriority'
import { FILTER_SEARCH_ALL } from './FilterSuggestTextBox'

// Utilities to set filter state values for TasksReviewTable based on review context
// (see ReviewTasksType for relevant contexts)

export const getFilterIds = (search, param) => {
  const searchParams = new URLSearchParams(search);
  for (let pair of searchParams.entries()) {
    if (pair[0] === param && pair[1]) {
      if (pair[1] === '0') {
        return [FILTER_SEARCH_ALL]
      }
      return pair[1].split(',').map(n => Number(n))
    }
  }

  return [FILTER_SEARCH_ALL];
}

// Status filter Idx should all be selected by default if there aren't specific selections in the URL
export const getTaskStatusFilterIds = (search, param) => {
  const searchParams = new URLSearchParams(search)
  for(let pair of searchParams.entries()) {
    if(pair[0] === param && pair[1]) {
      if(pair[1].length === 0) return []
      return pair[1].split(',').map(n => Number(n))
    }  
  }
  // return formatURLSearchParamEntryPairs(search, param) || 
  return Object.values(TaskStatus).filter(el => isReviewableStatus(el))
}

// Task review status filtering options are contingent on review context
export const getTaskReviewStatusFilterIds = (search, param, reviewTasksType) => {
  const searchParams = new URLSearchParams(search)
  for(let pair of searchParams.entries()) {
    if(pair[0] === param && pair[1]) {
      if(pair[1].length === 0) return []
      return pair[1].split(',').map(n => Number(n))
    }  
  }
  if(reviewTasksType === ReviewTasksType.metaReviewTasks) {
    return [TaskReviewStatus.approved, TaskReviewStatus.approvedWithFixes]
  } else if(reviewTasksType === ReviewTasksType.reviewedByMe ||
      reviewTasksType === ReviewTasksType.myReviewedTasks ||
      reviewTasksType === ReviewTasksType.allReviewedTasks) {
    return Object.values(TaskReviewStatus).filter(el => el !== TaskReviewStatus.unnecessary)  
  } else {
    return Object.values(TaskReviewStatus).filter(el => isNeedsReviewStatus(el))
  }
}

export const getTaskMetaReviewStatusFilterIds = (search, param, reviewTasksType) => {
  const searchParams = new URLSearchParams(search)
  for(let pair of searchParams.entries()) {
    if(pair[0] === param && pair[1]) {
      if(pair[1].length === 0) return []
      return pair[1].split(',').map(n => Number(n))
    }
  }
  if(reviewTasksType === ReviewTasksType.metaReviewTasks) {
    return [TaskMetaReviewStatusWithUnset.metaUnset, TaskReviewStatus.needed]
  } else {
    const allTaskMetaReviewStatusValues = Object.values(TaskReviewStatus)
      .filter(el => el !== TaskReviewStatus.unnecessary && isMetaReviewStatus(el))
    return [TaskMetaReviewStatusWithUnset.metaUnset, ...allTaskMetaReviewStatusValues]
  }
}

export const getTaskPriorityFilterIds = (search, param) => {
  const searchParams = new URLSearchParams(search)
  for(let pair of searchParams.entries()) {
    if(pair[0] === param && pair[1]) {
      if(pair[1].length === 0) return []
      return pair[1].split(',').map(n => Number(n))
    }
  } 
  return Object.values(TaskPriority)
}

