import _clone from "lodash/clone";
import _isEqualWith from "lodash/isEqualWith";
import _map from "lodash/map";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _uniqueId from "lodash/uniqueId";
import queryString from "query-string";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  CUSTOM_RANGE,
  DEFAULT_LEADERBOARD_COUNT,
  USER_TYPE_MAPPER,
  USER_TYPE_REVIEWER,
  fetchLeaderboard,
  fetchLeaderboardForUser,
  fetchReviewerLeaderboard,
} from "../../../services/Leaderboard/Leaderboard";

/**
 * WithLeaderboard provides leaderboard and leaderboardLoading props containing
 * the current leaderboard data and loading status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithLeaderboard = function (WrappedComponent, initialMonthsPast = 1, initialOptions = {}) {
  return class extends Component {
    state = {
      leaderboard: null,
      leaderboardLoading: false,
      showingCount: DEFAULT_LEADERBOARD_COUNT,
      fetchId: -1,
    };

    /** merge the given userLeaderboard in with the main leaderboard */
    mergeInUserLeaderboard = (userLeaderboard) => {
      if (userLeaderboard && userLeaderboard.length > 0) {
        const merged = _clone(this.state.leaderboard);
        if (merged) {
          merged.splice(userLeaderboard[0].rank - 1, userLeaderboard.length, ...userLeaderboard);
          this.setState({ leaderboard: merged });
        }
      }
    };

    leaderboardParams = (numberMonths, countryCode) => {
      const params = new Map([
        ["numberMonths", numberMonths],
        ["onlyEnabled", true],
        ["forProjects", null],
        ["forChallenges", null],
        ["forUsers", null],
        ["forCountries", null],
      ]);
      const leaderboardOptions = _merge({}, initialOptions, this.props.leaderboardOptions);
      if (leaderboardOptions) {
        if (typeof leaderboardOptions.onlyEnabled === "boolean") {
          params.set("onlyEnabled", leaderboardOptions.onlyEnabled);
        }

        if (leaderboardOptions.filterChallenges && Array.isArray(this.props.challenges)) {
          params.set("forChallenges", [_map(this.props.challenges, "id")]);
        }

        if (leaderboardOptions.filterProjects && Array.isArray(this.props.projects)) {
          params.set("forProjects", [_map(this.props.projects, "id")]);
        }

        if (leaderboardOptions.filterCountry && countryCode) {
          params.set("forCountries", [countryCode || this.props.countryCode]);
        }
      }

      return params.values();
    };

    updateLeaderboard = (
      numberMonths,
      countryCode,
      loadMore = false,
      startDate,
      endDate,
      userType = USER_TYPE_MAPPER,
    ) => {
      let showingCount = this.state.showingCount;

      if (loadMore) {
        showingCount += DEFAULT_LEADERBOARD_COUNT;
      }

      // If we are filtering by challenges and no challenges are provided then
      // we don't need to go to the server.
      const options = _merge({}, initialOptions, this.props.leaderboardOptions);
      if (
        options.filterChallenges &&
        Array.isArray(this.props.challenges) &&
        this.props.challenges.length < 1
      ) {
        return;
      }

      const currentFetch = _uniqueId();
      this.setState({ leaderboardLoading: true, showingCount, fetchId: currentFetch });

      const fetch =
        userType === USER_TYPE_REVIEWER
          ? this.props.fetchReviewerLeaderboard
          : this.props.fetchLeaderboard;

      fetch(
        ...this.leaderboardParams(numberMonths, countryCode),
        showingCount,
        startDate,
        endDate,
      ).then((leaderboard) => {
        if (currentFetch >= this.state.fetchId) {
          this.setState({ leaderboard });

          const userId = this.props.user?.id;
          // The reason for using _get is that the structure of the props may vary
          // depending on where this component is used, and accessing the user's score
          // directly through `this.props.user.score` may result in runtime errors if
          // the `user` object or the `score` property is not available in certain contexts.
          // By using `_get`, we safely handle cases where the expected property may be missing
          // or nested within a deeper structure.
          const userScore = this.props.user?.score;
          if (userScore && userId && !options.ignoreUser && userType !== USER_TYPE_REVIEWER) {
            this.props
              .fetchLeaderboardForUser(
                userId,
                1,
                ...this.leaderboardParams(numberMonths, countryCode),
                startDate,
                endDate,
              )
              .then((userLeaderboard) => {
                this.mergeInUserLeaderboard(userLeaderboard);
                this.setState({ leaderboardLoading: false });
              });
          } else {
            this.setState({ leaderboardLoading: false });
          }
        } else {
          this.setState({ leaderboardLoading: false });
        }
      });
    };

    setUserType = (userType, monthsPast, startDate, endDate) => {
      this.updateLeaderboard(
        monthsPast,
        this.props.countryCode,
        false,
        startDate,
        endDate,
        userType,
      );
    };

    setMonthsPast = (monthsPast, skipHistory = false, userType) => {
      if (monthsPast !== CUSTOM_RANGE) {
        const countryCode = this.props.countryCode;
        this.updateLeaderboard(monthsPast, countryCode, false, null, null, userType);

        if (!skipHistory) {
          this.props.history.push(`${this.props.location.pathname}?monthsPast=${monthsPast}`);
        }
      }
    };

    setDateRange = (startDate, endDate, skipHistory = false, userType) => {
      const countryCode = this.props.countryCode;
      this.updateLeaderboard(CUSTOM_RANGE, countryCode, false, startDate, endDate, userType);

      if (!skipHistory) {
        this.props.history.push(
          `${this.props.location.pathname}?monthsPast=${CUSTOM_RANGE}&startDate=${startDate}&endDate=${endDate}`,
        );
      }
    };

    setCountryCode = (countryCode) => {
      let dates =
        this.monthsPast() !== CUSTOM_RANGE
          ? ""
          : `&startDate=${this.startDate()}&endDate=${this.endDate()}`;

      if (countryCode === "ALL") {
        this.props.history.push(`/leaderboard?monthsPast=${this.monthsPast()}${dates}`);
      } else {
        this.props.history.push(
          `/country/${countryCode}/leaderboard?monthsPast=${this.monthsPast()}${dates}`,
        );
      }
    };

    loadMore = () => {
      this.updateLeaderboard(
        this.monthsPast(),
        this.props.countryCode,
        true,
        this.startDate(),
        this.endDate(),
      );
    };

    monthsPast = () => {
      const urlParams = queryString.parse(this.props.location?.search);
      if (urlParams.monthsPast) return parseInt(urlParams.monthsPast, 10);
      else return this.props.monthsPast || initialMonthsPast;
    };

    startDate = () => {
      if (this.monthsPast() === CUSTOM_RANGE) {
        const urlParams = queryString.parse(this.props.location?.search);
        if (urlParams.startDate) return urlParams.startDate;
        else return this.props.startDate;
      }
    };

    endDate = () => {
      if (this.monthsPast() === CUSTOM_RANGE) {
        const urlParams = queryString.parse(this.props.location?.search);
        if (urlParams.endDate) return urlParams.endDate;
        else return this.props.endDate;
      }
    };

    componentDidMount() {
      if (!initialOptions.isWidget) {
        this.updateLeaderboard(
          this.monthsPast(),
          this.props.countryCode,
          false,
          this.startDate(),
          this.endDate(),
        );
      }
    }

    componentDidUpdate(prevProps) {
      // A change to state will also fetch leaderboard data, so we only need to
      // worry about fetching if we're controlled and props change.
      if (
        this.props.monthsPast !== prevProps.monthsPast ||
        this.props.countryCode !== prevProps.countryCode ||
        !_isEqualWith(this.props.challenges, prevProps.challenges, (a, b) => a?.id === b?.id) ||
        !_isEqualWith(this.props.projects, prevProps.projects, (a, b) => a?.id === b?.id)
      ) {
        this.updateLeaderboard(
          this.monthsPast(),
          this.props.countryCode,
          false,
          this.startDate(),
          this.endDate(),
        );
      }
    }

    render() {
      const moreResults = this.state.leaderboard
        ? this.state.showingCount <= this.state.leaderboard.length
        : true;

      return (
        <WrappedComponent
          {..._omit(this.props, [
            "fetchLeaderboard",
            "fetchLeaderboardForUser",
            "fetchReviewerLeaderboard",
          ])}
          leaderboard={this.state.leaderboard}
          leaderboardLoading={this.state.leaderboardLoading}
          monthsPast={this.monthsPast()}
          startDate={this.startDate()}
          endDate={this.endDate()}
          countryCode={this.props.countryCode}
          setMonthsPast={this.setMonthsPast}
          setDateRange={this.setDateRange}
          setCountryCode={this.setCountryCode}
          setUserType={this.setUserType}
          loadMore={this.loadMore}
          hasMoreResults={moreResults}
          {...this.props}
        />
      );
    }
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { fetchLeaderboard, fetchLeaderboardForUser, fetchReviewerLeaderboard },
    dispatch,
  );

export default (WrappedComponent, initialMonthsPast, initialOptions) =>
  connect(
    null,
    mapDispatchToProps,
  )(WithLeaderboard(WrappedComponent, initialMonthsPast, initialOptions));
