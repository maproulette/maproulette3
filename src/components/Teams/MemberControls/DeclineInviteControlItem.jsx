import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import AppErrors from "../../../services/Error/AppErrors";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { declineInvite as declineTeamInvite } from "../TeamQueries";
import messages from "./Messages";

const DeclineInviteControlItem = (props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: declineInvite, isLoading: isSaving } = useMutation(declineTeamInvite, {
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
          declineInvite({ teamId: props.teamMember.team.id }).catch((error) => {
            props.addErrorWithDetails(AppErrors.team.failure, error.message);
          });
        }}
      >
        <FormattedMessage {...messages.declineInviteLabel} />
      </a>
    </li>
  );
};

DeclineInviteControlItem.propTypes = {
  user: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired,
  refetchQueries: PropTypes.array,
};

DeclineInviteControlItem.defaultProps = {
  refetchQueries: [],
};

export default DeclineInviteControlItem;
