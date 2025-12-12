import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ReviewTaskPane
 */
export default defineMessages({
  taskReviewLabel: {
    id: "ReviewTaskPane.label",
    defaultMessage: "Task Review",
  },

  taskReviewLabelStaticMap: {
    id: "ReviewTaskPane.label.staticMap",
    defaultMessage: "Task Review - Static Map",
  },

  taskLockedLabel: {
    id: "ReviewTaskPane.indicators.locked.label",
    defaultMessage: "Task locked",
  },

  taskUnlockLabel: {
    id: "ReviewTaskPane.controls.unlock.label",
    defaultMessage: "Unlock",
  },
});
