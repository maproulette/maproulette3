import PropTypes from "prop-types";
import { Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import AppErrors from "../../../services/Error/AppErrors";
import BusySpinner from "../../BusySpinner/BusySpinner";
import ConfirmAction from "../../ConfirmAction/ConfirmAction";
import AcceptInviteControlItem from "../MemberControls/AcceptInviteControlItem";
import DeclineInviteControlItem from "../MemberControls/DeclineInviteControlItem";
import RemoveMemberControlItem from "../MemberControls/RemoveMemberControlItem";
import { MY_TEAMS, deleteTeam as deleteTeamById } from "../TeamQueries";
import messages from "./Messages";

/**
 * Menu of controls for a team
 */
export const TeamControls = (props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteTeam, isLoading: isDeleting } = useMutation(deleteTeamById, {
    onSuccess: () => queryClient.invalidateQueries(MY_TEAMS),
  });
  const isSaving = isDeleting;

  if (isSaving) {
    return <BusySpinner />;
  }

  const isAdmin = props.teamMember.isUser(props.user) && props.teamMember.isTeamAdmin();
  // Deleting a team takes its projects and challenges with it, so it is the one
  // thing the server reserves to an owner rather than any admin.
  const isOwner = props.teamMember.isUser(props.user) && props.teamMember.isTeamOwner();

  return (
    <ul className="mr-links-green-lighter">
      {!props.suppressView && (
        <a onClick={() => props.viewTeam(props.teamMember.team)}>
          <FormattedMessage {...messages.viewTeamLabel} />
        </a>
      )}
      {isAdmin && (
        <Fragment>
          <li key="edit-team" className="mr-my-1">
            <a onClick={() => props.editTeam(props.teamMember.team)}>
              <FormattedMessage {...messages.editTeamLabel} />
            </a>
          </li>

          {isOwner && (
            <li key="delete-team" className="mr-my-1">
              <ConfirmAction>
                <a
                  onClick={() => {
                    deleteTeam({ teamId: props.teamMember.team.id }).catch((error) => {
                      props.addErrorWithDetails(AppErrors.team.failure, error.message);
                    });
                  }}
                >
                  <FormattedMessage {...messages.deleteTeamLabel} />
                </a>
              </ConfirmAction>
            </li>
          )}
        </Fragment>
      )}
      <AcceptInviteControlItem
        {...props}
        key="accept-invite"
        className="mr-my-1"
        refetchQueries={[MY_TEAMS]}
      />
      <DeclineInviteControlItem
        {...props}
        key="decline-invite"
        className="mr-my-1"
        refetchQueries={[MY_TEAMS]}
      />
      {props.teamMember.isActive() && props.teamMember.isUser(props.user) && (
        <RemoveMemberControlItem
          {...props}
          key="leave-team"
          className="mr-my-1"
          refetchQueries={[MY_TEAMS]}
        />
      )}
    </ul>
  );
};

TeamControls.propTypes = {
  teamMember: PropTypes.object.isRequired,
  viewTeam: PropTypes.func.isRequired,
  editTeam: PropTypes.func.isRequired,
  suppressView: PropTypes.bool,
};

export default TeamControls;
