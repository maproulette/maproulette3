import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TagDiffVisualization
 */
export default defineMessages({
  justChangesHeader: {
    id: "TagDiffVisualization.justChangesHeader",
    defaultMessage: "Proposed OSM Tag Changes",
  },

  allTagsHeader: {
    id: "TagDiffVisualization.header",
    defaultMessage: "Proposed OSM Tags",
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

  noChangeset: {
    id: "TagDiffVisualization.noChangeset",
    defaultMessage: "No changeset would be uploaded",
  },

  tagListTooltip: {
    id: "TagDiffVisualization.controls.tagList.tooltip",
    defaultMessage: "View as tag list",
  },

  changesetTooltip: {
    id: "TagDiffVisualization.controls.changeset.tooltip",
    defaultMessage: "View as OSM changeset",
  },

  editTagsTooltip: {
    id: "TagDiffVisualization.controls.editTags.tooltip",
    defaultMessage: "Edit tags",
  },

  keepTagLabel: {
    id: "TagDiffVisualization.controls.keepTag.label",
    defaultMessage: "Keep Tag",
  },

  addTagLabel: {
    id: "TagDiffVisualization.controls.addTag.label",
    defaultMessage: "Add Tag",
  },

  deleteTagTooltip: {
    id: "TagDiffVisualization.controls.deleteTag.tooltip",
    defaultMessage: "Delete tag",
  },

  saveLabel: {
    id: "TagDiffVisualization.controls.saveEdits.label",
    defaultMessage: "Done",
  },

  cancelLabel: {
    id: "TagDiffVisualization.controls.cancelEdits.label",
    defaultMessage: "Cancel",
  },

  restoreFixLabel: {
    id: "TagDiffVisualization.controls.restoreFix.label",
    defaultMessage: "Revert Edits",
  },

  restoreFixTooltip: {
    id: "TagDiffVisualization.controls.restoreFix.tooltip",
    defaultMessage: "Restore initial proposed tags",
  },

  tagNamePlaceholder: {
    id: "TagDiffVisualization.controls.tagName.placeholder",
    defaultMessage: "Tag Name",
  },
})
