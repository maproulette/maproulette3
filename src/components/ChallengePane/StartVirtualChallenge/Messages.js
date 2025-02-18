import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with StartVirtualChallenge
 */
export default defineMessages({
  createVirtualChallenge: {
    id: "VirtualChallenge.controls.create.label",
    defaultMessage: "Work on {taskCount} Selected Tasks",
  },

  virtualChallengeNameLabel: {
    id: "VirtualChallenge.fields.name.label",
    defaultMessage: 'Name your "virtual" challenge',
  },

  startLabel: {
    id: "VirtualChallenge.controls.start.label",
    defaultMessage: "Start",
  },

  tooManyTasks: {
    id: "VirtualChallenge.tooManyTasks",
    defaultMessage: "At most {max} tasks can be worked on at once",
  },

  selectedCount: {
    id: "VirtualChallenge.selectedCount",
    defaultMessage: "You have {count} selected",
  },
});
