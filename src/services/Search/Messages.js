import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with Sort.
 */
export default defineMessages({
  name: {
    id: "Admin.EditProject.form.name.label",
    defaultMessage: "Name",
  },
  created: {
    id: "Challenge.sort.created",
    defaultMessage: "Newest",
  },
  Created: {
    id: "Challenge.sort.oldest",
    defaultMessage: "Oldest",
  },
  completion_percentage: {
    id: "Challenge.sort.completion",
    defaultMessage: "% Complete",
  },
  tasks_remaining: {
    id: "BurndownChart.tooltip",
    defaultMessage: "Tasks Remaining",
  },
  popularity: {
    id: "Challenge.sort.popularity",
    defaultMessage: "Popular",
  },
  cooperative_type: {
    id: "Challenge.cooperativeType.changeFile",
    defaultMessage: "Cooperative",
  },
  score: {
    id: "User.sort.numOfChallenges",
    defaultMessage: "Score",
  },
  default: {
    id: "Admin.EditChallenge.form.customTaskStyles.controls.default.label",
    defaultMessage: "Default",
  },
});
