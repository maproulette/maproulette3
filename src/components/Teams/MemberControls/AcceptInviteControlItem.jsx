import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import AppErrors from "../../../services/Error/AppErrors";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { acceptInvite as acceptTeamInvite } from "../TeamQueries";
import messages from "./Messages";

/**
 * Control item for accepting an invitation to join a team
 */
const AcceptInviteControlItem = (props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: acceptInvite, isLoading: isSaving } = useMutation(acceptTeamInvite, {
    onSuccess: () => props.refetchQueries.forEach((key) => queryClient.invalidateQueries(key)),
  });

  // The team member needs have an invitation and be the current user
  if (!props.teamMember.isInvited() || !props.teamMember.isUser(props.user)) {
    return null;
  }

  if (isSaving) {
    return <BusySpinner />;
  }

  return (
    <li className={props.className}>
      <a
        onClick={() => {
          acceptInvite({ teamId: props.teamMember.team.id }).catch((error) => {
            props.addErrorWithDetails(AppErrors.team.failure, error.message);
          });
        }}
      >
        <FormattedMessage {...messages.acceptInviteLabel} />
      </a>
    </li>
  );
};

AcceptInviteControlItem.propTypes = {
  user: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired,
  refetchQueries: PropTypes.array,
};

AcceptInviteControlItem.defaultProps = {
  refetchQueries: [],
};

export default AcceptInviteControlItem;
