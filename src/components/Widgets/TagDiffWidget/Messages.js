import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TagDiffWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TagDiffWidget.label",
    defaultMessage: "Tag Fix",
  },

  title: {
    id: "Widgets.TagDiffWidget.title",
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
