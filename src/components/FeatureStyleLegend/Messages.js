import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with FeatureStyleLegend
 */
export default defineMessages({
  noStyles: {
    id: "FeatureStyleLegend.noStyles.label",
    defaultMessage: "This challenge is not using custom styles",
  },

  containsLabel: {
    id: "FeatureStyleLegend.comparators.contains.label",
    defaultMessage: "contains",
  },

  missingLabel: {
    id: "FeatureStyleLegend.comparators.missing.label",
    defaultMessage: "missing",
  },

  existsLabel: {
    id: "FeatureStyleLegend.comparators.exists.label",
    defaultMessage: "exists",
  },
});
