import AsManager from "../../../interactions/User/AsManager";
import {
  createCommentsColumn,
  createControlsColumn,
  createEditBundleColumn,
  createTagsColumn,
} from "./actionColumns.jsx";
import { createExpanderColumn, createSelectedColumn } from "./baseColumns.jsx";
import {
  createAdditionalReviewersColumn,
  createMetaReviewStatusColumn,
  createMetaReviewedAtColumn,
  createMetaReviewedByColumn,
  createReviewDurationColumn,
  createReviewRequestedByColumn,
  createReviewStatusColumn,
  createReviewedAtColumn,
  createReviewedByColumn,
} from "./reviewColumns.jsx";
import {
  createCompletedDurationColumn,
  createFeatureIdColumn,
  createIdColumn,
  createMappedOnColumn,
  createPriorityColumn,
  createStatusColumn,
} from "./taskColumns.jsx";

/**
 * Creates all column type definitions for the task table
 *
 * @param {Object} props - Component props
 * @param {string|null} taskBaseRoute - Base route for task links
 * @param {Function} openComments - Callback to open comments modal
 * @returns {Object} - Object containing all column definitions
 */
export const setupColumnTypes = (props, taskBaseRoute, openComments) => {
  const manager = AsManager(props.user);

  const columns = {
    // Base columns
    expander: createExpanderColumn(),
    selected: createSelectedColumn(props),

    // Task columns
    featureId: createFeatureIdColumn(props),
    id: createIdColumn(props),
    status: createStatusColumn(props),
    priority: createPriorityColumn(props),
    mappedOn: createMappedOnColumn(props),
    completedDuration: createCompletedDurationColumn(props),

    // Bundle column
    editBundle: createEditBundleColumn(props),

    // Review columns
    reviewRequestedBy: createReviewRequestedByColumn(props),
    reviewedAt: createReviewedAtColumn(props),
    metaReviewedAt: createMetaReviewedAtColumn(props),
    reviewDuration: createReviewDurationColumn(props),
    reviewedBy: createReviewedByColumn(props),
    metaReviewedBy: createMetaReviewedByColumn(props),
    reviewStatus: createReviewStatusColumn(props),
    metaReviewStatus: createMetaReviewStatusColumn(props),
    additionalReviewers: createAdditionalReviewersColumn(props),

    // Action columns
    controls: createControlsColumn(props, taskBaseRoute, manager),
    comments: createCommentsColumn(props, openComments),
    tags: createTagsColumn(props),
  };

  return columns;
};
