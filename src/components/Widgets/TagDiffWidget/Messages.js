import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TagDiffWidget
 */
export default defineMessages({
  label: {
    id: "Challenge.cooperativeType.tags",
    defaultMessage: "Tag Fix",
  },

  title: {
    id: "TagDiffVisualization.justChangesHeader",
    defaultMessage: "Proposed OSM Tag Changes",
  },

  disabledDescription: {
    id: "Widgets.TagDiffWidget.disabledDescription",
    defaultMessage:
      "This task has proposed tag fixes, but you've disabled seeing them for your user. You can re-enable this in User Settings.",
  },

  viewAllTagsLabel: {
    id: "Widgets.TagDiffWidget.controls.viewAllTags.label",
    defaultMessage: "Show all Tags",
  },

  editTagsLabel: {
    id: "Widgets.TagDiffWidget.controls.editTags.label",
    defaultMessage: "Edit Tags",
  },
});
