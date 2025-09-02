import _debounce from "lodash/debounce";
import _filter from "lodash/filter";
import _isEmpty from "lodash/isEmpty";
import _startsWith from "lodash/startsWith";
import { Component } from "react";
import { findTeam } from "../../../services/Team/Team";

/**
 * WithTeamSearch provides a findTeam function to the wrapped component that
 * allows it to initiate searches for MapRoulette teams by name or name
 * fragment
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithTeamSearch = function (WrappedComponent) {
  return class extends Component {
    state = {
      isSearchingTeams: false,
      teamResults: [],
    };

    /**
     * @private
     */
    performSearch = _debounce(
      (teamName) => {
        this.setState({ isSearchingTeams: true });

        findTeam(teamName).then((results) => {
          this.setState({ isSearchingTeams: false, teamResults: results });
        });
      },
      1000,
      { leading: true },
    );

    /**
     * Initiates search for team with the given name or name fragment
     */
    searchTeam = (teamName) => {
      if (_isEmpty(teamName)) {
        this.setState({ teamResults: [] });
        return;
      }

      // Start off by filtering our existing search results so that we don't continue
      // to show results that no longer match the new team name
      this.setState({
        isSearchingTeams: true,
        teamResults: _filter(this.state.teamResults, (result) =>
          _startsWith(result.name.toLowerCase(), teamName.toLowerCase()),
        ),
      });

      this.performSearch(teamName);
    };

    teamKey = (team) => team.id;

    teamLabel = (team) => team.name;

    render() {
      return (
        <WrappedComponent
          isSearching={this.state.isSearchingTeams}
          searchResults={this.state.teamResults}
          search={this.searchTeam}
          resultKey={this.teamKey}
          resultLabel={this.teamLabel}
          {...this.props}
        />
      );
    }
  };
};

export default WithTeamSearch;
