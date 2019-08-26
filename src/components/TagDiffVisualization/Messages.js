import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TagDiffVisualization
 */
export default defineMessages({
  header: {
    id: "TagDiffVisualization.header",
    defaultMessage: "Proposed OSM Tag Changes",
  },

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
