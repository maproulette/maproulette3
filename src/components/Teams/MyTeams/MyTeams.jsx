import { useQuery } from "@apollo/client";
import _find from "lodash/find";
import _throttle from "lodash/throttle";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import AsTeamMember from "../../../interactions/TeamMember/AsTeamMember";
import { subscribeToTeamUpdates, unsubscribeFromTeamUpdates } from "../../../services/Team/Team";
import BusySpinner from "../../BusySpinner/BusySpinner";
import Dropdown from "../../Dropdown/Dropdown";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import TeamControls from "../TeamControls/TeamControls";
import { MY_TEAMS } from "../TeamQueries";
import ViewTeam from "../ViewTeam/ViewTeam";
import messages from "./Messages";

/**
 * Lists all the teams on which the current user is a member
 */
export const MyTeams = function (props) {
  const { loading, error, data, refetch } = useQuery(MY_TEAMS, {
    variables: { userId: props.user.id },
    partialRefetch: true,
  });

  // Refresh the teams when this component updates to avoid stale data. It's
  // throttled down to one request at most every 2 seconds to avoid rapid
  // refreshing
  useEffect(() => refreshTeams(refetch));

  useEffect(() => {
    subscribeToTeamUpdates((message) => {
      if (
        message.data.userId === props.user.id ||
        _find(data.userTeams, { teamId: message.data.teamId })
      ) {
        refetch();
      }
    }, "MyTeams");

    return () => unsubscribeFromTeamUpdates("MyTeams");
  });

  if (error) {
    throw error;
  }

  if (loading) {
    return <BusySpinner />;
  }

  const TeamView = props.showCards ? TeamCards : TeamList;
  return <TeamView {...props} userTeams={data.userTeams} />;
};

// Render teams as cards
const TeamCards = (props) => {
  if (props.userTeams.length === 0) {
    return (
      <span className="mr-text-white">
        <FormattedMessage {...messages.noTeams} />
      </span>
    );
  }

  const cards = props.userTeams.map((teamUser) => {
    return (
      <div
        key={teamUser.team.id}
        className="mr-w-1/3 mr-min-w-120 mr-bg-black-10 mr-mx-2 mr-mb-8 mr-p-4 mr-rounded mr-max-h-screen50 mr-overflow-y-auto"
      >
        <ViewTeam
          {...props}
          team={teamUser.team}
          teamControls={
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={(dropdown) => (
                <button onClick={dropdown.toggleDropdownVisible} className="mr-text-green-lighter">
                  <SvgSymbol
                    sym="cog-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-4 mr-h-4"
                  />
                </button>
              )}
              dropdownContent={() => (
                <TeamControls {...props} teamMember={AsTeamMember(teamUser)} suppressView />
              )}
            />
          }
        />
      </div>
    );
  });

  return <div className="mr-flex mr-justify-between mr-flex-wrap">{cards}</div>;
};

// Render teams as list
const TeamList = (props) => {
  const teamItems = props.userTeams.map((teamUser) => {
    const teamMember = AsTeamMember(teamUser);
    return (
      <li key={teamMember.team.id} className="mr-h-5 mr-my-2">
        <div className="mr-flex mr-justify-between">
          <a onClick={() => props.viewTeam(teamMember.team)}>{teamMember.team.name}</a>

          <div className="mr-flex mr-justify-end mr-items-center">
            <div className="mr-mr-4 mr-text-white">
              <FormattedMessage {...teamMember.roleDescription()} />
            </div>

            <div className="mr-min-w-6 mr-h-5">
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={(dropdown) => (
                  <button
                    onClick={dropdown.toggleDropdownVisible}
                    className="mr-flex mr-items-center mr-text-white-40"
                  >
                    <SvgSymbol
                      sym="navigation-more-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5"
                    />
                  </button>
                )}
                dropdownContent={() => <TeamControls {...props} teamMember={teamMember} />}
              />
            </div>
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className="mr-flex mr-flex-col mr-justify-between">
      {teamItems.length === 0 ? (
        <span className="mr-text-white">
          <FormattedMessage {...messages.noTeams} />
        </span>
      ) : (
        <ul className="mr-links-green-lighter">{teamItems}</ul>
      )}
    </div>
  );
};

const refreshTeams = _throttle(
  (refetch) => {
    refetch();
  },
  2000,
  { leading: true, trailing: false },
);

MyTeams.propTypes = {
  user: PropTypes.object.isRequired,
  viewTeam: PropTypes.func.isRequired,
  editTeam: PropTypes.func.isRequired,
};

export default MyTeams;
