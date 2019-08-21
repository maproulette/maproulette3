import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskDiffVisualization
 */
export default defineMessages({
  currentLabel: {
    id: "TagDiffVisualization.current.label",
    defaultMessage: "Current",
  },

  proposedLabel: {
    id: "TagDiffVisualization.proposed.label",
    defaultMessage: "Proposed",
  },

  noChanges: {
    id: "TagDiffVisualization.noChanges",
    defaultMessage: "No Tag Changes",
  },

  tagListTooltip: {
    id: "TagDiffVisualization.controls.tagList.tooltip",
    defaultMessage: "View as tag list",
  },

  changesetTooltip: {
    id: "TagDiffVisualization.controls.changeset.tooltip",
    defaultMessage: "View as OSM changeset",
  },
})
