import { TaskStatus, isReviewableStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority }
       from '../../services/Task/TaskPriority/TaskPriority'
import { TaskReviewStatus, isNeedsReviewStatus, isMetaReviewStatus, TaskMetaReviewStatusWithUnset }
        from '../../services/Task/TaskReview/TaskReviewStatus'

// Utilities for generating initial task filter statuses based on review workspace context

export const reviewableTaskStatusFilterValues = Object.values(TaskStatus).filter(el => isReviewableStatus(el))
export const taskPriorityFilterValues = Object.values(TaskPriority)

export const reviewStatusFilterValuesByContext = context => {
  if(context === "metaReviewTasks") return [TaskReviewStatus.approved, TaskReviewStatus.approvedWithFixes]
  if(context === "tasksReviewedByMe") return Object.values(TaskReviewStatus)
    .filter(el => el !== TaskReviewStatus.unnecessary)
  return Object.values(TaskReviewStatus).filter(el => isNeedsReviewStatus(el))
}

export const metaReviewStatusFilterValuesByContext = context => {
  if(context === "metaReviewTasks") return [TaskMetaReviewStatusWithUnset.metaUnset, TaskReviewStatus.needed]
  const allTaskMetaReviewStatusValues = Object.values(TaskReviewStatus)
    .filter(el => el !== TaskReviewStatus.unnecessary && isMetaReviewStatus(el))     
  return [TaskMetaReviewStatusWithUnset.metaUnset, ...allTaskMetaReviewStatusValues]
}

export const getInitialTaskStatusFiltersByContext = context => {
  // return ({
  //   status: reviewableTaskStatusFilterValues.join(","),
  //   priorities: taskPriorityFilterValues.join(","),
  //   reviewStatus: reviewStatusFilterValuesByContext(context).join(","),
  //   metaReviewStatus: metaReviewStatusFilterValuesByContext(context).join(",")
  // })
  return ({
    status: reviewableTaskStatusFilterValues,
    priorities: taskPriorityFilterValues,
    reviewStatus: reviewStatusFilterValuesByContext(context),
    metaReviewStatus: metaReviewStatusFilterValuesByContext(context)
  })
}


