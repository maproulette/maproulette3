import _every from "lodash/every";
import _filter from "lodash/filter";
import _isEmpty from "lodash/isEmpty";
import _omit from "lodash/omit";
import { Component } from "react";
import { challengePassesArchivedFilter } from "../../../services/Challenge/ChallengeArchived/ChallengeArchived";
import { challengePassesCategorizationKeywordsFilter } from "../../../services/Challenge/ChallengeCategorizationKeywords/ChallengeCategorizationKeywords";
import { challengePassesDifficultyFilter } from "../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty";
import { challengePassesGlobalFilter } from "../../../services/Challenge/ChallengeGlobal/ChallengeGlobal";
import { challengePassesKeywordFilter } from "../../../services/Challenge/ChallengeKeywords/ChallengeKeywords";
import { challengePassesLocationFilter } from "../../../services/Challenge/ChallengeLocation/ChallengeLocation";
import { challengePassesProjectFilter } from "../../../services/Challenge/ChallengeProject/ChallengeProject";

const allFilters = [
  challengePassesArchivedFilter,
  challengePassesGlobalFilter,
  challengePassesDifficultyFilter,
  challengePassesKeywordFilter,
  challengePassesCategorizationKeywordsFilter,
  challengePassesLocationFilter,
  challengePassesProjectFilter,
];

/**
 * The WithFilteredChallenges HOC applies all of the configured challenge
 * filters to the given challenges, passing down those that pass the filter to
 * the WrappedComponent.  The prop containing the challenges, as well as the
 * output prop for passing them down, can be customized.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithFilteredChallenges(
  WrappedComponent,
  challengesProp = "challenges",
  outputProp,
) {
  return class extends Component {
    challengePassesAllFilters(challenge) {
      return _every(allFilters, (passes) =>
        passes(this.props.searchFilters, challenge, this.props),
      );
    }

    render() {
      const filteredChallenges = _filter(this.props[challengesProp], (challenge) =>
        this.challengePassesAllFilters(challenge),
      );

      if (_isEmpty(outputProp)) {
        outputProp = challengesProp;
      }

      return (
        <WrappedComponent
          {...{ [outputProp]: filteredChallenges }}
          unfilteredChallenges={this.props[challengesProp]}
          {..._omit(this.props, outputProp)}
        />
      );
    }
  };
}
