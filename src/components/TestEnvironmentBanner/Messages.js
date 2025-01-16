import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with testEnvironmentBanner
 */
export default defineMessages({
  stagingTitle: {
    id: "Admin.testEnvironmentBanner.stagingTitle",
    defaultMessage: "You are in a MapRoulette Staging environment.",
  },
  localTitle: {
    id: "Admin.testEnvironmentBanner.localTitle",
    defaultMessage: "You are in a MapRoulette Local environment.",
  },
});
